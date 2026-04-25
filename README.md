# G&P Office Management System (ERP)

A unified, high-performance ERP solution specifically designed for Chartered Accountancy firms. This system focuses on professional continuity, ensuring no client task is lost during staff absences through a robust "Handover" architecture.

---

## 🏗 Project Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Python 3.10+, FastAPI (Asynchronous).
- **Database:** PostgreSQL with `asyncpg`.
- **Storage:** Local File System (Isolated for privacy).

---

## 📂 Repository Structure
```text
gnp-erp-system/
├── gnp-erp/             # React Frontend (Vite)
├── gnp-backend/         # FastAPI Backend
│   ├── uploads/         # Local Document Storage
│   └── main.py          # API Entry Point
├── .gitignore           # Unified ignore rules
└── README.md            # This documentation
```

##  DB setup

- CREATE DATABASE gnp_erp;

## Backend

cd gnp-backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy asyncpg pydantic python-multipart
python main.py


## Frontend Execution (React)

Tutorial:
https://youtu.be/Z9Mni83IK5o


cd gnp-erp
npm install
npm run dev

