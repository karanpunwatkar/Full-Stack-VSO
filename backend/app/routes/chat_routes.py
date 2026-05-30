from fastapi import APIRouter
from pydantic import BaseModel
import json
from app.database import domains_collection
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

router = APIRouter(prefix="/api/v1/chat")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

from typing import List

class ChatMessagePayload(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessagePayload]

class RemediationRequest(BaseModel):
    domain: str
    issue: str

class DomainReportRequest(BaseModel):
    domain_id: int

@router.post("/")
async def chat_with_ai(data: ChatRequest):
    try:
        # Fetch live domain state so the AI can reference actual dashboard data
        domains = list(domains_collection.find({}, {"_id": 0}))
        domain_data_str = json.dumps(domains, default=str)

        # Build conversation context string
        prompt = f"You are an elite AI Virtual Security Officer managing the user's cyber intelligence platform. Here is the live JSON data of the user's monitored domains and scan results from the dashboard:\n{domain_data_str}\n\nRespond concisely and accurately to the user's queries based on this data. Format beautifully in Markdown. Do NOT expose raw JSON, explain it like an officer.\n\n---\n"
        for msg in data.messages:
            speaker = "User" if msg.role == "user" else "AI"
            prompt += f"{speaker}: {msg.content}\n"
        prompt += "---\nAI:"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return {"response": response.text}

    except Exception as e:
        print("ERROR:", e)
        return {"error": str(e)}

@router.post("/remediation")
async def generate_remediation(data: RemediationRequest):
    try:
        prompt = f"""You are an elite AI Virtual Security Officer.
For the domain '{data.domain}', the following security status/issue was detected:
'{data.issue}'

Please provide:
1. A clear explanation of what this status means for this specific domain.
2. If it is a RISK: A detailed, step-by-step remediation plan (including exact commands, tools, and configurations).
3. If it is SECURE: Professional insights on why it is secure and best practices to maintain this state.

Format your response beautifully using standard Markdown with clear sections and a professional 'Officer' tone."""
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        return {"remediation_plan": response.text}

    except Exception as e:
        print("ERROR (Remediation):", e)
        return {"error": str(e)}

@router.post("/domain-report")
async def generate_domain_report(data: DomainReportRequest):
    try:
        doc = domains_collection.find_one({"id": data.domain_id}, {"_id": 0})
        if not doc:
            return {"error": "Domain not found."}
            
        domain_data_str = json.dumps(doc, indent=2, default=str)
        
        prompt = f"You are an expert Virtual Security Officer. Please analyze the following domain scan data and write a formal, comprehensive Executive Summary Report for the domain '{doc.get('domain')}'. Address the threat score, any open ports, SSL validity, and IP resolution. Format it beautifully using Markdown with sections such as Executive Summary, Vulnerability Analysis, and Recommendations. Keep it professional and readable.\n\nData:\n{domain_data_str}"
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return {"report": response.text}
    except Exception as e:
        print("ERROR (Domain Report):", e)
        return {"error": str(e)}