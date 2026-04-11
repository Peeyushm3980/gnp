G&P Office Management System (ERP)
A unified ERP solution for Chartered Accountancy firms, featuring Task Handover management, Document Vault, CRM, and automated Billing.

📂 Project Structure
Plaintext
gnp-erp-system/
├── gnp-erp/             # React (Vite) Frontend
├── gnp-backend/         # FastAPI Python Backend
└── README.md            # This guide
🛠️ 1. Database Setup (PostgreSQL)
Before running the application, ensure PostgreSQL is installed and running on your local machine.

Create the Database:
Open your PostgreSQL terminal (psql) or pgAdmin and run:

SQL
CREATE DATABASE gnp_erp;
Verify Connection URL:
The backend is configured to connect via:
postgresql+asyncpg://Peeyush.Mishra:admin@localhost:5432/gnp_erp
(Ensure your Postgres password is set to 'admin' or update database.py accordingly).

🐍 2. Backend Execution (FastAPI)
Navigate to backend directory:

Bash
cd gnp-backend
Setup Virtual Environment:

Bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
Install Dependencies:

Bash
pip install fastapi uvicorn sqlalchemy asyncpg pydantic python-multipart
Run the Server:

Bash
python main.py
The backend will be live at: http://127.0.0.1:8000
Interactive Documentation (Swagger): http://127.0.0.1:8000/docs

⚛️ 3. Frontend Execution (React + Vite)
Open a new terminal and navigate to frontend:

Bash
cd gnp-erp
Install Dependencies:

Bash
npm install
Run the Development Server:

Bash
npm run dev
The frontend will be live at: http://localhost:5173

🚀 Key Features to Demonstrate
Task Handover: Go to the Dashboard and click "Pick Up Task" on any item assigned to an absent staff member.

Document Vault: Upload a PDF to see it save to the local uploads/ folder and appear in the database. Use the Eye icon to view it.

Live Pipeline: Add a new lead in the CRM and watch the Total Pipeline Value widget update instantly.

Service Tickets: Log a high-priority client query and "Open" it to see the detail slide-over.

📝 Important Notes
CORS: If you change the frontend port, update the allow_origins in gnp-backend/main.py.

Local Storage: All uploaded documents are stored in gnp-backend/uploads/. This folder is ignored by Git to maintain client privacy.

Migrations: On the first run, the backend will automatically create all necessary tables in your Postgres database.

Troubleshooting
Network Error: Ensure the Backend is running before trying to use the Frontend.

Postgres Error: Check that the gnp_erp database exists and your credentials in database.py are correct.
