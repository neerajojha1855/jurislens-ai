import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.document import parse_document, DocumentParsingError

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert ".pdf" in data["supported_formats"]
    assert ".docx" in data["supported_formats"]

def test_invalid_extension_rejection():
    with pytest.raises(DocumentParsingError) as exc_info:
        parse_document("unsupported.txt", b"Plain text content")
    assert "Unsupported file format" in str(exc_info.value)

def test_corrupted_pdf_handling():
    with pytest.raises(DocumentParsingError):
        parse_document("corrupt.pdf", b"Not a valid PDF header")

@patch("app.main.parse_document")
@patch("app.main.analyze_legal_document")
def test_analyze_document_success(mock_analyze, mock_parse):
    # Mock the parsing and AI analysis to avoid real API calls in tests
    mock_parse.return_value = ("Sample extracted text", 1, "application/pdf")
    mock_analyze.return_value = {
        "metadata": {
            "filename": "test.pdf",
            "file_type": "application/pdf",
            "file_size_bytes": 1024,
            "page_or_section_count": 1,
            "estimated_reading_time_mins": 1
        },
        "executive_summary": "Test summary",
        "key_parties": [],
        "rights_summary": [],
        "obligations": [],
        "risks": [],
        "lawyer_checklist": [],
        "raw_document_id": "1234"
    }

    response = client.post("/api/analyze", files={"file": ("test.pdf", b"%PDF-1.4 mock content")})
    assert response.status_code == 200
    data = response.json()
    assert data["executive_summary"] == "Test summary"

@patch("app.main.answer_legal_question")
def test_chat_endpoint_success(mock_answer):
    mock_answer.return_value = {
        "answer": "This is a mocked answer.",
        "relevant_clauses": []
    }

    payload = {
        "document_id": "1234",
        "document_text": "Mock document text",
        "question": "What is the penalty?",
        "chat_history": []
    }

    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["answer"] == "This is a mocked answer."

def test_chat_endpoint_missing_context():
    payload = {
        "document_id": "invalid-id",
        "document_text": "",
        "question": "What is the penalty?",
        "chat_history": []
    }

    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    assert "Document context is required" in response.json()["detail"]