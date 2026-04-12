from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from database import Base
import datetime

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
    category = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)

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
    status = Column(String, default="Open")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

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