from datetime import datetime, timezone, timedelta
from typing import List

from fastapi import FastAPI, Depends, Form, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import shutil
from database import get_db, engine, Base
import models, schemas
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="G&P ERP Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173","https://aez88hvyo8.ap.loclx.io","https://bountiful-nonpunitory-albert.ngrok-free.dev"],
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
        client_phone=client_phone, # Save the phone number
        expiry_date=expiry_dt,
        category=category
    )
    db.add(new_doc)
    await db.commit()
    return {"message": "File uploaded locally and record saved to Postgres"}

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
@app.get("/api/documents", response_model=List[schemas.Document])
async def get_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Document))
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
@app.get("/api/tickets", response_model=List[schemas.Ticket])
async def get_tickets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Ticket))
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

@app.patch("/api/tickets/{ticket_id}", response_model=schemas.Ticket)
async def update_ticket_status(ticket_id: int, payload: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Ticket).filter(models.Ticket.id == ticket_id))
    db_ticket = result.scalar_one_or_none()
    
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Update status if provided in the body (e.g., {"status": "Resolved"})
    if "status" in payload:
        db_ticket.status = payload["status"]
        
    await db.commit()
    await db.refresh(db_ticket)
    return db_ticket

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

    # 1. Check if user already exists
    existing_user = await db.execute(select(models.User).where(models.User.username == username))
    if existing_user.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")

    # 2. Create new user
    new_user = models.User(
        username=username,
        password_hash=password, # In production, use pwd_context.hash(password)
        role=role
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": f"Staff member {username} added successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)