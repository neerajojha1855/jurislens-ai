import uuid
import math
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
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
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

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

    contents = await file.read()
    file_size_mb = len(contents) / (1024*1024)
    if file_size_mb > MAX_UPLOAD_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum allowed limit of {MAX_UPLOAD_SIZE_MB} MB.")
    
    try:
        extracted_text, count, file_type = parse_document(file.filename, contents)
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

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)