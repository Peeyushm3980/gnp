from sqlalchemy import JSON, Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password_hash = Column(String)
    role = Column(String) # root, manager, user
    
    # NEW: Self-referential foreign key
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationship to children (subordinates)
    subordinates = relationship("User", backref="manager", remote_side=[id])
    
class ClientLead(Base): # For ClientCRM
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    company = Column(String)
    status = Column(String, default="Initial Call")
    value = Column(Float)

class Document(Base): # For DocumentVault
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String) # Path in local file system
    client_name = Column(String)
    client_phone = Column(String)
    category = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=True)
    owner = relationship("User", backref="documents")

class Task(Base): # For ERPDashboard
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    client = Column(String)
    service = Column(String)
    assigned_to = Column(String)
    status = Column(String)
    last_action = Column(Text)

class Ticket(Base): # For SupportTickets
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String)
    client = Column(String)
    priority = Column(String)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="Open") # Open, Resolved, Hold, Cancel, Pending
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    assignee = relationship("User", backref="tickets")

class TicketAudit(Base):
    __tablename__ = "ticket_audits"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    changed_by = Column(String) # Username of the person who made the change
    change_type = Column(String) # "Status Update" or "Reassignment"
    old_value = Column(String)
    new_value = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket", backref="audit_logs")

# Add this to models.py if not already there
class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    client = Column(String)
    amount = Column(Float)
    status = Column(String, default="Draft")
    date = Column(DateTime, default=datetime.datetime.utcnow)

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True)
    staff_name = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    latitude = Column(Float)
    longitude = Column(Float)
    location_name = Column(String)

class IngestedEmail(Base):
    __tablename__ = "ingested_emails"
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String, unique=True, index=True)
    thread_id = Column(String)
    subject = Column(String)
    sender = Column(String)
    recipient = Column(String)
    body = Column(Text)
    snippet = Column(String)
    received_at = Column(DateTime)
    has_attachments = Column(Boolean, default=False)
    # Stores metadata about files: [{"filename": "tax_doc.pdf", "file_id": "..."}]
    attachments_metadata = Column(JSON, nullable=True) 
    is_converted_to_ticket = Column(Boolean, default=False)