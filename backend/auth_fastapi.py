"""
NER Sentinel AI - High-Security FastAPI Authentication Gateway
Provides strict validation, 12-round Bcrypt salted hashing for passwords and mobile numbers,
RBAC clearance tokenization, and SQLite persistence for emergency roadblock SMS/WhatsApp notifications.
"""

import os
import re
import sqlite3
import datetime
from pathlib import Path
from typing import Optional, Dict, Any

import bcrypt
import jwt
from pydantic import BaseModel, Field, field_validator
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Database Path
DB_PATH = Path(__file__).parent / "db" / "database.sqlite"
JWT_SECRET = os.getenv("JWT_SECRET", "NER_SENTINEL_GOVT_INDIA_HIGH_SECURITY_SECRET_2026")
JWT_ALGORITHM = "HS256"

# Ensure Database Schema is Migrated
def init_auth_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        country_code TEXT DEFAULT '+91',
        mobile_hash TEXT,
        mobile_masked TEXT,
        service_badge_id TEXT,
        role TEXT NOT NULL DEFAULT 'citizen',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Check if columns exist; if not, add them via ALTER TABLE
    cur.execute("PRAGMA table_info(users)")
    cols = [col[1] for col in cur.fetchall()]
    if "country_code" not in cols:
        cur.execute("ALTER TABLE users ADD COLUMN country_code TEXT DEFAULT '+91'")
    if "mobile_hash" not in cols:
        cur.execute("ALTER TABLE users ADD COLUMN mobile_hash TEXT")
    if "mobile_masked" not in cols:
        cur.execute("ALTER TABLE users ADD COLUMN mobile_masked TEXT")
    if "service_badge_id" not in cols:
        cur.execute("ALTER TABLE users ADD COLUMN service_badge_id TEXT")
    conn.commit()
    conn.close()

init_auth_db()

# Password Policy Validator
def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter (A-Z).")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter (a-z).")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one numeric digit (0-9).")
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", password):
        raise ValueError("Password must contain at least one special symbol (!@#$%^&*).")

# Request Models
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Full Name & Rank")
    email: str = Field(..., description="Official Email Address")
    role: str = Field(default="citizen", description="Clearance Role (citizen, driver, operator, disaster_mgmt, admin)")
    password: str = Field(..., min_length=8, description="Password adhering to strict security policy")
    country_code: str = Field(default="+91", description="Country Code (e.g. +91, +1, +44)")
    mobile_number: str = Field(..., min_length=7, description="Flexible Mobile Number")
    service_badge_id: Optional[str] = Field(default=None, description="Departmental Service Badge ID")

    @field_validator("email")
    def validate_email_format(cls, v):
        clean = v.strip().lower()
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", clean):
            raise ValueError("Invalid email format.")
        return clean

    @field_validator("password")
    def validate_password(cls, v):
        validate_password_strength(v)
        return v

    @field_validator("country_code")
    def validate_country_code(cls, v):
        clean = v.strip()
        if not clean.startswith("+") and clean.isdigit():
            clean = f"+{clean}"
        if not re.match(r"^\+\d{1,4}$", clean):
            raise ValueError("Invalid country code format (e.g. +91, +1).")
        return clean

    @field_validator("mobile_number")
    def validate_mobile(cls, v):
        digits = re.sub(r"\D", "", v)
        if len(digits) < 7 or len(digits) > 15:
            raise ValueError("Mobile number must contain between 7 and 15 digits.")
        return digits

class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Email Address")
    password: str = Field(..., description="Password")

# FastAPI Router & App Setup
auth_router = APIRouter(tags=["Authentication & Security"])

def hash_with_12_rounds(plain_text: str) -> str:
    """Generates 12-round Bcrypt salted hash."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain_text.encode("utf-8"), salt).decode("utf-8")

def verify_12_round_hash(plain_text: str, hashed: str) -> bool:
    """Verifies string against Bcrypt hash."""
    return bcrypt.checkpw(plain_text.encode("utf-8"), hashed.encode("utf-8"))

def mask_mobile(country_code: str, mobile_digits: str) -> str:
    """Creates privacy-tokenized display string (e.g. +91 ******4912)."""
    if len(mobile_digits) <= 4:
        return f"{country_code} {mobile_digits}"
    masked = "*" * (len(mobile_digits) - 4) + mobile_digits[-4:]
    return f"{country_code} {masked}"

def generate_jwt(user_id: int, email: str, role: str, badge: Optional[str]) -> str:
    payload = {
        "id": user_id,
        "email": email,
        "role": role,
        "serviceBadgeId": badge or "NER-PUBLIC-USER",
        "iss": "NER-Sentinel-FastAPI-Security-Gateway",
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
@auth_router.post("/v1/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest):
    """
    Dynamic First-Come, First-Served Administrator Registration & Access Control:
    - No hardcoded whitelist: The first 10 unique users registering with the Administrator role are dynamically provisioned.
    - Capacity Cap: Rejects registrations when 10 administrator slots are filled.
    """
    requested_role = req.role.lower().strip() if req.role else "citizen"
    normalized_email = req.email.lower().strip()

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    # 1. Dynamic Administrator Capacity Check (First 10 dynamic slots)
    if requested_role == "admin":
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        admin_count = cur.fetchone()[0]
        if admin_count >= 10:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum capacity of 10 administrators has been reached."
            )

    # Check for existing email
    cur.execute("SELECT id FROM users WHERE LOWER(email) = ?", (normalized_email,))
    if cur.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already registered in the Sentinel AI registry. Please sign in."
        )

    # 12-round Bcrypt salted hashing for Password AND Mobile Number
    password_hash = hash_with_12_rounds(req.password)
    full_e164_mobile = f"{req.country_code}{req.mobile_number}"
    mobile_hash = hash_with_12_rounds(full_e164_mobile)
    mobile_masked = mask_mobile(req.country_code, req.mobile_number)

    valid_role = requested_role if requested_role in ['admin', 'operator', 'disaster_mgmt', 'driver', 'citizen', 'public_citizen'] else 'citizen'
    clean_name = req.name.strip()
    badge = req.service_badge_id.strip() if req.service_badge_id else ("NER-CORE-ADMIN" if valid_role == "admin" else None)

    cur.execute("""
        INSERT INTO users (name, email, password_hash, country_code, mobile_hash, mobile_masked, service_badge_id, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (clean_name, normalized_email, password_hash, req.country_code, mobile_hash, mobile_masked, badge, valid_role))
    
    user_id = cur.lastrowid
    conn.commit()

    cur.execute("SELECT id, name, email, role, country_code, mobile_masked, service_badge_id, created_at FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()

    token = generate_jwt(row[0], row[2], row[3], row[6])

    security_classification = "FULL_SYSTEM_COMMAND_CLEARANCE" if row[3] == "admin" else ("PUBLIC_ACCESS" if row[3] in ["citizen", "public_citizen"] else "RESTRICTED_COMMAND")

    return {
        "success": True,
        "message": "Dynamic Administrator Command Profile Created with Full System Privileges." if row[3] == "admin" else "High-Security Officer/Citizen Profile Created Successfully.",
        "data": {
            "user": {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "role": row[3],
                "country_code": row[4],
                "mobile_masked": row[5],
                "serviceBadgeId": row[6],
                "securityClassification": security_classification,
                "adminAccess": row[3] == "admin",
                "privileges": {
                    "dashboardModules": True,
                    "routingEngines": True,
                    "simulations": True,
                    "telemetryControls": True,
                    "fleetDispatch": True
                } if row[3] == "admin" else {},
                "created_at": row[7]
            },
            "token": token
        }
    }

@auth_router.post("/login")
@auth_router.post("/v1/auth/login")
def login_user(req: UserLoginRequest):
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, password_hash, role, country_code, mobile_masked, service_badge_id, created_at FROM users WHERE LOWER(email) = ?", (req.email.lower().strip(),))
    user = cur.fetchone()

    if not user or not verify_12_round_hash(req.password, user[3]):
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication Failed: Incorrect security credentials."
        )

    user_role = user[4]
    normalized_email = user[2].lower().strip()

    # Dynamic Admin Verification on Login: Verify against dynamically established admins in DB
    if user_role == "admin":
        cur.execute("SELECT id FROM users WHERE role = 'admin' AND LOWER(email) = ?", (normalized_email,))
        if not cur.fetchone():
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: This account is not an authorized Administrator."
            )

    conn.close()
    token = generate_jwt(user[0], user[2], user[4], user[7])

    security_classification = (
        "FULL_SYSTEM_COMMAND_CLEARANCE" if user_role == "admin"
        else ("PUBLIC_ACCESS" if user_role in ("citizen", "public_citizen") else "RESTRICTED_COMMAND")
    )

    return {
        "success": True,
        "message": "Command Clearance Authorized",
        "data": {
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[4],
                "country_code": user[5],
                "mobile_masked": user[6],
                "serviceBadgeId": user[7] or ("NER-CORE-ADMIN" if user_role == "admin" else None),
                "securityClassification": security_classification,
                "adminAccess": user_role == "admin",
                "privileges": {
                    "dashboardModules": True,
                    "routingEngines": True,
                    "simulations": True,
                    "telemetryControls": True,
                    "fleetDispatch": True
                } if user_role == "admin" else {},
                "created_at": user[8]
            },
            "token": token
        }
    }

# Create standalone FastAPI application
app = FastAPI(
    title="NER Sentinel AI - Authentication Gateway",
    description="High-Security Bcrypt 12-Round Password & Mobile Salted Hashing with E.164 Country Code Support",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")
app.include_router(auth_router, prefix="/api")

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "FastAPI Authentication Gateway",
        "security": "12-Round Bcrypt Salted Credentials & E.164 Mobile Privacy Tokenization",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
