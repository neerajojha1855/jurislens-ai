import os
import uuid
import math
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.gzip import GZipMiddleware
from starlette.requests import Request
import asyncio
from app.config import FRONTEND_URL, MAX_UPLOAD_SIZE_MB
from app.models.schemas import DocumentAnalysisResponse, DocumentMetadata, ChatRequest, ChatResponse
from app.services.document import parse_document, DocumentParsingError
from app.services.gemini import analyze_legal_document, answer_legal_question

app = FastAPI(
    title="JurisLens AI - LEgal Document Intelligence API",
    description="Backend service powering JurisLens AI for document simplification, risk extraction and grounded legal Q&A.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

DOCUMENT_CACHE = {}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "JurisLens AI Backend",
        "version": "1.0.0",
        "supported_formats": [".pdf", ".docx"]
    }

@app.post("/api/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document_endpoint(file: UploadFile=File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Securely check file size before reading into memory
    file.file.seek(0, 2)
    file_size_mb = file.file.tell() / (1024*1024)
    file.file.seek(0)
    
    if file_size_mb > MAX_UPLOAD_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum allowed limit of {MAX_UPLOAD_SIZE_MB} MB.")
        
    contents = await file.read()
    
    try:
        # Offload synchronous parsing to a separate thread to avoid blocking the event loop
        extracted_text, count, file_type = await asyncio.to_thread(parse_document, file.filename, contents)
    except DocumentParsingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal document processing error: {str(e)}")
    
    word_count = len(extracted_text.split())
    reading_time = max(1, math.ceil(word_count/200))

    metadata = DocumentMetadata(
        filename=file.filename,
        file_type=file_type,
        file_size_bytes=len(contents),
        page_or_section_count=count,
        estimated_reading_time_mins=reading_time
    )

    doc_id = str(uuid.uuid4())
    DOCUMENT_CACHE[doc_id] = extracted_text

    try:
        analysis = analyze_legal_document(doc_id, extracted_text, metadata)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    document_text = request.document_text
    if not document_text and request.document_id in DOCUMENT_CACHE:
        document_text = DOCUMENT_CACHE[request.document_id]
    
    if not document_text:
        raise HTTPException(status_code=400, detail="Document context is required for Q&A.")
    
    try:
        chat_req = ChatRequest(
            document_id=request.document_id,
            document_text=document_text,
            question=request.question,
            chat_history=request.chat_history
        )

        return answer_legal_question(chat_req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat generation failed: {str(e)}")

frontend_dist = os.path.join(os.path.dirname(__file__), "../../frontend/dist")

if os.path.exists(os.path.join(frontend_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

# Catch all route to serve the React index.html for all non-api route
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if full_path.startswith("api/"):
        return {"error": "API route not found"}

    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"error": "Frontend not built or not found"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)