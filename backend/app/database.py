from pymongo import MongoClient
from pymongo.errors import OperationFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv
import os
import logging

load_dotenv(override=True)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "cyberguard")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Force a connection check at startup
    client.admin.command("ping")
    logging.info("✅ MongoDB Atlas connected successfully")
except OperationFailure as e:
    logging.error(f"❌ MongoDB Auth Failed: {e.details.get('errmsg', str(e))}")
    logging.error("👉 Check your MONGO_URI credentials in .env (username/password)")
    client = None
except ServerSelectionTimeoutError as e:
    logging.error(f"❌ MongoDB connection timeout: {e}")
    logging.error("👉 Check your network / Atlas IP whitelist")
    client = None
except Exception as e:
    logging.error(f"❌ MongoDB unexpected error: {e}")
    client = None

db = client[DB_NAME] if client is not None else None
domains_collection = db["domains"] if db is not None else None