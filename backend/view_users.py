"""
NER Sentinel AI - Registered Users & Telemetry Data Viewer
Run this script anytime to inspect all user registration records in the database.
Usage: python backend/view_users.py
"""

import sys
import codecs
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "db" / "database.sqlite"

def display_users():
    if not DB_PATH.exists():
        print(f"[ERROR] Database file not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name, email, role, country_code, mobile_masked, service_badge_id, created_at, password_hash, mobile_hash
        FROM users
        ORDER BY id DESC
    """)
    rows = cur.fetchall()
    conn.close()

    print("=" * 110)
    print(f" NER SENTINEL AI — REGISTERED USERS DATABASE ({len(rows)} TOTAL USERS)")
    print(f" Database File: {DB_PATH}")
    print("=" * 110)

    if not rows:
        print("No users registered yet.")
        return

    for idx, row in enumerate(rows, 1):
        uid, name, email, role, c_code, mobile_masked, badge, created_at, pass_hash, mob_hash = row
        print(f"\n[#{idx}] User ID: {uid}")
        print(f"  👤 Full Name & Rank : {name}")
        print(f"  📧 Email Address     : {email}")
        print(f"  🛡️ Clearance Role    : {role.upper()}")
        print(f"  🌍 Country Code      : {c_code or '+91'}")
        print(f"  📱 Masked Mobile     : {mobile_masked or 'Not Provided'}")
        print(f"  🎖️ Service Badge ID  : {badge or 'Civilian / None'}")
        print(f"  🕒 Registered At     : {created_at}")
        print(f"  🔒 Password Hash     : {pass_hash[:25]}... (12-Round Bcrypt Salted)")
        if mob_hash:
            print(f"  🔐 Mobile Hash       : {mob_hash[:25]}... (12-Round Bcrypt Salted)")
        print("-" * 110)

if __name__ == "__main__":
    display_users()
