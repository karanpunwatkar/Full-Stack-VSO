from fastapi import FastAPI
from app.routes import domain_routes, chat_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ CORS (IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex="http://(localhost|127\.0\.0\.1):[0-9]+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routes
app.include_router(domain_routes.router)
app.include_router(chat_routes.router)

@app.get("/")
def home():
    return {"message": "CyberGuard Backend Running 🚀"}
