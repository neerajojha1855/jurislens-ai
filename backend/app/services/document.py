import os
import io
import docx
from pypdf import PdfReader

class DocumentParsingError(Exception):
    pass


def extract_text_from_pdf(file_type: bytes) -> tuple(str, int):
    # Extracts text and page count from a PDF file.
    try:
        reader = PdfReader(io.BytesIO(file_type))
        page_count = len(reader.pages)
        text_content = []
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_content.append(f"--- [Page {idx+1}] ---\n{page_text}")
        
        full_text = "\n\n".join(text_content).strip()
        if not full_text:
            raise DocumentParsingError("The provided PDF contains no extractable text or is image-only/scanned.")
        
        return full_text, page_count
    except Exception as e:
        if isinstance(e, DocumentParsingError):
            raise e
        
        raise DocumentParsingError(f"Failed to parse PDF document: {str(e)}")

def extract_text_from_docx(file_type: bytes) -> tuple(str, int):
    # Extracts text and paragragh/section count from a DOCX file.
    try:
        doc = docx.Document(io.BytesIO(file_type))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

        table_text = []
        for table in doc.tables:
            for row in table.rows:
                row_data = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_data:
                    table_text.append(" | ".join(row_data))
        
        all_text = "\n\n".join(paragraphs+table_text).strip()
        section_count = max(len(doc.sections), 1)

        if not all_text:
            raise DocumentParsingError("The provided DOCX contains no extractable text.")
        
        return all_text, section_count
    except Exception as e:
        if isinstance(e, DocumentParsingError):
            raise e
        
        raise DocumentParsingError(f"Failed to parse DOCX document: {str(e)}")

def parse_document(filename: str, file_type: bytes) -> tuple[str, int, str]:
    # Validates format strictly to .pdf or .docx and extracts textual content
    ext = os.path.splitext(filename.lower())[1]
    if ext == ".pdf":
        text, count = extract_text_from_pdf(file_type)
        return text, count, "PDF"
    elif ext == ".docx":
        text, count = extract_text_from_docx(file_type)
        return text, count, "DOCX"
    else:
        raise DocumentParsingError(f"Unsupported file format: '{ext}'. Only .pdf and .docx documents are accepted.")