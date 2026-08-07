# AdCraft Lite — AI-Powered Advertisement Marketplace

AdCraft Lite is a simplified marketplace where businesses (**Brand Owners**) can post advertisement requirements and freelance creators (**Creators**) can apply, communicate, and deliver marketing collateral — with Gemini AI-assisted advertisement description generation.

---

## Technology Stack

- **Frontend**: React (Vite), Tailwind CSS/Design System, React Router v6, Axios, React Hot Toast, Lucide React Icons
- **Backend**: FastAPI (Python), SQLAlchemy ORM, Alembic Migrations, Pydantic v2, JWT Auth, Passlib (Bcrypt)
- **Database**: PostgreSQL (Development & Neon Production ready)
- **Media Storage**: Cloudinary for images and videos
- **AI**: Gemini 2.0 Flash API (Ad Description generation)

---

## Local Setup Instructions

### 1. Database Setup
Start a local PostgreSQL database using Docker Compose:
```bash
docker-compose up -d
```
*Default connection string:* `postgresql://postgres:postgres@localhost:5432/adcraft`

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```
Backend server will run at `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend application will run at `http://localhost:5173`.

---

## Deployment Guide

### Frontend (Vercel)
1. Import `frontend/` folder into Vercel.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend (Render)
1. Create a Web Service on Render pointing to `backend/`.
2. Environment: Python 3
3. Build Command: `pip install -r requirements.txt && alembic upgrade head`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables:
   - `DATABASE_URL`: Neon PostgreSQL string
   - `JWT_SECRET`: Random secure string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `GEMINI_API_KEY`
