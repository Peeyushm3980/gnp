from typing import List

from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
    client_name: str, 
    category: str, 
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    new_doc = models.Document(
        filename=file.filename, 
        file_path=file_path, 
        client_name=client_name, 
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
@app.post("/api/tickets")
async def create_ticket(ticket: schemas.TicketCreate, db: AsyncSession = Depends(get_db)):
    db_ticket = models.Ticket(**ticket.dict())
    db.add(db_ticket)
    await db.commit()
    return db_ticket

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)