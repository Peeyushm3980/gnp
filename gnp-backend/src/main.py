from datetime import datetime, timezone, timedelta
from typing import List

from fastapi import FastAPI, Depends, Form, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import os
import shutil
from database import get_db, engine, Base
from gmail_utils import download_attachment, get_gmail_service, parse_message_parts
import models, schemas
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="G&P ERP Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Use "*" temporarily to prove it's a CORS issue
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# --- CLIENT CRM API ---
@app.get("/api/leads")
async def get_leads(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ClientLead))
    return result.scalars().all()

# --- DOCUMENT VAULT API (Local File System) ---
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    client_name: str = Form(...),    # Changed from query param to Form
    client_phone: str = Form(None), # Added for WhatsApp feature
    owner_id: int = Form(...), # NEW: Capture the logged-in user ID
    is_public: bool = Form(True), # NEW: Capture toggle state
    expiry_date: str = Form(None),   # Changed to Form
    category: str = Form(...),       # Changed to Form
    db: AsyncSession = Depends(get_db)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    expiry_dt = None
    if expiry_date and expiry_date.strip() and expiry_date != 'null':
        try:
            expiry_dt = datetime.strptime(expiry_date, '%Y-%m-%d')
        except ValueError:
            expiry_dt = None
    
    new_doc = models.Document(
        filename=file.filename, 
        file_path=file_path, 
        client_name=client_name, 
        owner_id=owner_id,
        is_public=is_public,
        client_phone=client_phone, # Save the phone number
        expiry_date=expiry_dt,
        category=category
    )
    db.add(new_doc)
    await db.commit()
    return {"message": "File uploaded locally and record saved to Postgres"}

@app.patch("/api/documents/{doc_id}/visibility")
async def toggle_visibility(doc_id: int, is_public: bool, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Document).where(models.Document.id == doc_id))
    doc = result.scalars().first()
    doc.is_public = is_public
    await db.commit()
    return {"status": "updated", "is_public": doc.is_public}

# --- ERP DASHBOARD API ---
@app.get("/api/tasks")
async def get_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Task))
    return result.scalars().all()

# --- SUPPORT TICKETS API ---
@app.post("/api/tickets", response_model=schemas.Ticket)
async def create_ticket(ticket: schemas.TicketCreate, db: AsyncSession = Depends(get_db)):
    # Use .model_dump() instead of .dict() for Pydantic V2
    # This converts the Pydantic object into a clean Python dictionary
    ticket_data = ticket.model_dump() 
    
    new_ticket = models.Ticket(**ticket_data)
    
    db.add(new_ticket)
    try:
        await db.commit()
        await db.refresh(new_ticket)
        return new_ticket
    except Exception as e:
        await db.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Database insertion failed")

@app.post("/api/leads", response_model=schemas.ClientLead)
async def create_lead(lead: schemas.ClientLeadCreate, db: AsyncSession = Depends(get_db)):
    # Convert Pydantic model to SQLAlchemy model
    new_lead = models.ClientLead(**lead.dict())
    
    db.add(new_lead)
    await db.commit()
    await db.refresh(new_lead) # Get the generated ID back from Postgres
    return new_lead

# --- DOCUMENT VAULT (GET) ---
@app.get("/api/documents")
async def get_documents(user_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Get all users in this user's sub-tree (subordinates)
    async def get_subordinate_ids(uid):
        res = await db.execute(select(models.User.id).where(models.User.parent_id == uid))
        ids = res.scalars().all()
        for sub_id in ids:
            ids.extend(await get_subordinate_ids(sub_id))
        return ids

    sub_ids = await get_subordinate_ids(user_id)
    allowed_owner_ids = [user_id] + sub_ids

    # 2. Query: (is_public OR owner is in allowed_owner_ids)
    query = select(models.Document).where(
        (models.Document.is_public == True) | 
        (models.Document.owner_id.in_(allowed_owner_ids))
    )
    
    result = await db.execute(query)
    return result.scalars().all()

# --- ERP DASHBOARD (POST) ---
@app.post("/api/tasks", response_model=schemas.Task)
async def create_task(task: schemas.TaskCreate, db: AsyncSession = Depends(get_db)):
    new_task = models.Task(**task.dict())
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

# --- SUPPORT TICKETS (GET) ---
@app.get("/api/tickets")
async def get_tickets(db: AsyncSession = Depends(get_db)):
    query = select(models.Ticket).options(
        selectinload(models.Ticket.assignee),
        selectinload(models.Ticket.audit_logs) # LOAD THE AUDIT LOGS
    ).order_by(models.Ticket.created_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()

# --- FIRM ACCOUNTS / INVOICES (GET & POST) ---
@app.get("/api/invoices", response_model=List[schemas.Invoice])
async def get_invoices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Invoice))
    return result.scalars().all()

@app.post("/api/invoices", response_model=schemas.Invoice)
async def create_invoice(invoice: schemas.InvoiceCreate, db: AsyncSession = Depends(get_db)):
    new_invoice = models.Invoice(**invoice.dict())
    db.add(new_invoice)
    await db.commit()
    await db.refresh(new_invoice)
    return new_invoice

# main.py

@app.patch("/api/tasks/{task_id}", response_model=schemas.Task)
async def reassign_task(task_id: int, payload: dict, db: AsyncSession = Depends(get_db)):
    # Fetch the existing task
    result = await db.execute(select(models.Task).filter(models.Task.id == task_id))
    db_task = result.scalar_one_or_none()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update the assigned_to field and the last action for audit trail
    if "assigned_to" in payload:
        db_task.assigned_to = payload["assigned_to"]
        db_task.last_action = f"Reassigned to {payload['assigned_to']}"
    
    await db.commit()
    await db.refresh(db_task)
    return db_task
@app.get("/api/documents/file/{document_id}")
async def get_file(document_id: int, action: str = "view", db: AsyncSession = Depends(get_db)):
    # 1. Fetch document record from Postgres
    result = await db.execute(select(models.Document).filter(models.Document.id == document_id))
    db_doc = result.scalar_one_or_none()
    
    if not db_doc or not os.path.exists(db_doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on local disk")

    # 2. Determine if it should open in browser or download
    # "inline" opens in a new tab; "attachment" triggers a download
    disposition = "inline" if action == "view" else "attachment"

    return FileResponse(
        path=db_doc.file_path,
        filename=db_doc.filename,
        content_disposition_type=disposition
    )

@app.post("/api/attendance", response_model=schemas.Attendance)
async def mark_attendance(data: schemas.AttendanceCreate, db: AsyncSession = Depends(get_db)):
    new_entry = models.Attendance(**data.dict())
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)
    return new_entry

# --- COMPLIANCE EXPIRY API ---
@app.get("/api/compliance/expiring")
async def get_expiring_docs(db: AsyncSession = Depends(get_db)):
    # 1. Get today's date but set time to 00:00:00
    # This ensures documents expiring today are included
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # 2. Set the 90-day future window
    limit = today_start + timedelta(days=90)
    
    # 3. Query: Expiry must be >= start of today and <= limit
    query = select(models.Document).where(
        models.Document.expiry_date >= today_start,
        models.Document.expiry_date <= limit
    ).order_by(models.Document.expiry_date.asc())
    
    result = await db.execute(query)
    return result.scalars().all()

@app.patch("/api/tickets/{ticket_id}")
async def update_ticket(ticket_id: int, data: dict, user_name: str = "Admin", db: AsyncSession = Depends(get_db)):
    # 1. Fetch ticket with current relationships
    query = select(models.Ticket).options(selectinload(models.Ticket.assignee)).where(models.Ticket.id == ticket_id)
    result = await db.execute(query)
    ticket = result.scalars().first()
    
    # 2. Track Status Change
    if "status" in data and data["status"] != ticket.status:
        audit = models.TicketAudit(
            ticket_id=ticket.id,
            changed_by=user_name,
            change_type="Status Update",
            old_value=ticket.status,
            new_value=data["status"]
        )
        db.add(audit)
        ticket.status = data["status"]

    # 3. Track Assignment Change
    if "assigned_to_id" in data and data["assigned_to_id"] != ticket.assigned_to_id:
        # Fetch old/new names for the audit log text
        old_name = ticket.assignee.username if ticket.assignee else "Unassigned"
        
        ticket.assigned_to_id = data["assigned_to_id"]
        await db.flush() # Temporarily push change to get new relationship
        
        # Refresh to get new assignee name
        await db.refresh(ticket, ["assignee"])
        new_name = ticket.assignee.username if ticket.assignee else "Unassigned"

        audit = models.TicketAudit(
            ticket_id=ticket.id,
            changed_by=user_name,
            change_type="Reassignment",
            old_value=old_name,
            new_value=new_name
        )
        db.add(audit)

    await db.commit()
    return ticket

@app.get("/api/attendance/latest")
async def get_latest_locations(db: AsyncSession = Depends(get_db)):
    # SQL logic: Get the latest record per staff member based on timestamp
    query = text("""
        SELECT DISTINCT ON (staff_name) *
        FROM attendance
        ORDER BY staff_name, timestamp DESC
    """)
    result = await db.execute(query)
    # Convert rows to dictionaries for JSON response
    rows = result.fetchall()
    return [dict(row._mapping) for row in rows]

@app.get("/api/compliance/expiring", response_model=list[schemas.DocumentRead])
async def get_expiring_compliance(db: AsyncSession = Depends(get_db)):
    today = datetime.now(timezone.utc).replace(tzinfo=None)
    limit = today + timedelta(days=90)
    
    # 3. Use the naive objects in your query
    query = select(models.Document).where(
        models.Document.expiry_date >= today,
        models.Document.expiry_date <= limit
    )
    
    try:
        result = await db.execute(query)
        return result.scalars().all()
    except Exception as e:
        print(f"Database Query Error: {e}")
        raise HTTPException(status_code=500, detail="Database comparison failed")

@app.post("/api/login")
async def login(data: dict, db: AsyncSession = Depends(get_db)):
    username = data.get("username")
    password = data.get("password")
    
    # Query user from DB
    result = await db.execute(select(models.User).where(models.User.username == username))
    user = result.scalars().first()
    
    # Simple verification (For demo: in production use passlib.hash)
    if not user or user.password_hash != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role
    }

@app.get("/api/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).order_by(models.User.username))
    users = result.scalars().all()
    # Return users without exposing password hashes
    return [{"id": u.id, "username": u.username, "role": u.role} for u in users]

# 2. DELETE USER
@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    await db.commit()
    return {"message": f"User {user.username} removed from firm access"}

@app.post("/api/users")
async def create_user(data: dict, db: AsyncSession = Depends(get_db)):
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "user")
    
    # NEW: Ensure parent_id is an integer or None to prevent ROLLBACK
    parent_raw = data.get("parent_id")
    parent_id = int(parent_raw) if parent_raw and str(parent_raw).isdigit() else None

    # 1. Check if user already exists
    existing_user = await db.execute(select(models.User).where(models.User.username == username))
    if existing_user.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")

    # 2. Create new user with hierarchy link
    new_user = models.User(
        username=username,
        password_hash=password, 
        role=role,
        parent_id=parent_id 
    )
    
    db.add(new_user)
    try:
        await db.commit() # The ROLLBACK happened here in your logs
        return {"message": f"Staff member {username} added", "id": new_user.id}
    except Exception as e:
        await db.rollback()
        print(f"DATABASE ERROR: {str(e)}") # This will show the exact constraint fail in console
        raise HTTPException(status_code=500, detail="Check if the selected Manager exists.")

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch document metadata
    result = await db.execute(select(models.Document).where(models.Document.id == doc_id))
    doc = result.scalars().first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Delete physical file if it exists
    if doc.filename:
        file_path = os.path.join(UPLOAD_DIR, doc.filename)
        if os.path.exists(file_path):
            os.remove(file_path)

    # 3. Remove record from Database
    await db.delete(doc)
    await db.commit()
    
    return {"message": f"Document {doc.filename} deleted successfully"}

@app.delete("/api/compliance/tasks/{task_id}")
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch the task from the 'tasks' table
    result = await db.execute(select(models.Task).where(models.Task.id == task_id))
    task = result.scalars().first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task engagement not found")

    try:
        # 2. Remove the task record
        await db.delete(task)
        await db.commit()
        
        return {"status": "success", "deleted_id": task_id}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/support/tickets/{ticket_id}")
async def delete_ticket(ticket_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch the ticket from the database
    result = await db.execute(select(models.Ticket).where(models.Ticket.id == ticket_id))
    ticket = result.scalars().first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    try:
        # 2. Remove the ticket
        await db.delete(ticket)
        await db.commit()
        
        # 3. Return valid JSON to prevent frontend parsing errors
        return {"status": "success", "message": f"Ticket #{ticket_id} removed"}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- CLIENT CRM DELETE API ---
@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch the lead record
    result = await db.execute(select(models.ClientLead).where(models.ClientLead.id == lead_id))
    lead = result.scalars().first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Client lead not found")

    try:
        # 2. Remove from Database
        await db.delete(lead)
        await db.commit()
        
        return {"status": "success", "message": f"Lead for {lead.name} removed"}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/users/hierarchy/{user_id}", response_model=schemas.UserTreeResponse)
async def get_user_hierarchy(user_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch user and their subordinates recursively
    # Note: In production, consider using a CTE for deep trees
    async def build_tree(current_user_id):
        result = await db.execute(
            select(models.User).where(models.User.id == current_user_id)
        )
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Manually load subordinates to build the nested structure
        sub_result = await db.execute(
            select(models.User).where(models.User.parent_id == current_user_id)
        )
        subs = sub_result.scalars().all()
        
        return {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "subordinates": [await build_tree(s.id) for s in subs]
        }

    return await build_tree(user_id)

@app.post("/api/gmail/sync")
async def sync_gmail_inbox(db: AsyncSession = Depends(get_db)):
    service = get_gmail_service() # Uses your existing OAuth logic
    
    # Search for last 7 days of emails
    query = "newer_than:7d"
    results = service.users().messages().list(userId='me', q=query).execute()
    messages = results.get('messages', [])

    new_emails_count = 0
    for msg_ref in messages:
        # Check if already exists to avoid duplicates
        existing = await db.execute(select(models.IngestedEmail).where(models.IngestedEmail.message_id == msg_ref['id']))
        if existing.scalars().first():
            continue

        # Fetch full message content
        msg = service.users().messages().get(userId='me', id=msg_ref['id'], format='full').execute()
        payload = msg['payload']
        headers = payload.get('headers', [])
        
        # Parse Headers
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "No Subject")
        sender = next((h['value'] for h in headers if h['name'] == 'From'), "Unknown")
        
        # Extract Body and Attachments (Using logic from your uploaded file)
        body, attachments = parse_message_parts(service, msg_ref['id'], payload)

        new_email = models.IngestedEmail(
            message_id=msg_ref['id'],
            thread_id=msg['threadId'],
            subject=subject,
            sender=sender,
            body=body[:5000],
            received_at=datetime.fromtimestamp(int(msg['internalDate'])/1000),
            attachments_metadata=attachments,
            has_attachments=len(attachments) > 0
        )
        db.add(new_email)
        new_emails_count += 1

    await db.commit()
    return {"status": "success", "count": len(messages)}

@app.get("/api/gmail/emails")
async def get_ingested_emails(db: AsyncSession = Depends(get_db)):
    # Fetch all ingested emails ordered by newest first
    query = select(models.IngestedEmail).order_by(models.IngestedEmail.received_at.desc())
    result = await db.execute(query)
    emails = result.scalars().all()
    return emails

class SaveAttachmentRequest(BaseModel):
    email_id: int
    attachment_id: str
    filename: str

@app.post("/api/gmail/save-attachment")
async def save_gmail_attachment(
    request: SaveAttachmentRequest,  # Use the schema here
    db: AsyncSession = Depends(get_db)
):
    # Access data via request.email_id, request.attachment_id, etc.
    result = await db.execute(
        select(models.IngestedEmail).where(models.IngestedEmail.id == request.email_id)
    )
    email = result.scalars().first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email record not found")

    service = get_gmail_service()
    file_data = download_attachment(service, email.message_id, request.attachment_id)
    
    if not file_data:
        raise HTTPException(status_code=400, detail="Could not download attachment")

    # Ensure UPLOAD_DIR exists
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_path = os.path.join(UPLOAD_DIR, request.filename)
    with open(file_path, "wb") as f:
        f.write(file_data)

    new_doc = models.Document(
        filename=request.filename,
        file_path=file_path,
        client_name=email.sender,
        category="Email Attachment"
    )
    db.add(new_doc)
    await db.commit()

    return {"status": "success", "message": f"{request.filename} saved"}
       
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)