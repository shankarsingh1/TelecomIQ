from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import traceback
from app.agents.chat_agent import handle_chat_message

class ChatRequest(BaseModel):
    message: str

router = APIRouter(prefix="/agent", tags=["Agent Chat"])

@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Async chat endpoint for high-concurrency AI assistance.
    """
    try:
        message = request.message
        result = await handle_chat_message(message)
        return result

    except Exception as e:
        print("❌ CHAT ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
