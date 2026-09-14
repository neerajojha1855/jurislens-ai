import pytest
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