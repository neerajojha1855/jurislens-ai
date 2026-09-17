from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class DocumentMetadata(BaseModel):
    filename: str
    file_type: str
    file_size_bytes: int
    page_or_section_count: int
    estimated_reading_time_mins: int

class RiskItem(BaseModel):
    severity: Literal["HIGH", "MEDIUM", "LOW"]
    title: str
    clause_quote: Optional[str] = Field(default="", description="Exact excerpt or section title from the document")
    plain_explanation: Optional[str] = Field(default="", description="Why this matters and how it could negatively affect the user")
    recommendation: Optional[str] = Field(default="", description="Actionable mitigation or alternative negotiation clause")

class ObligationItem(BaseModel):
    party: str = Field(description="The party responsible (e.g. user, service provider, employer)")
    obligation_text: str = Field(description="What must be done or avoided")
    deadline_or_condition: Optional[str] = Field(default=None, description="Timeline or prerequisites")

class LawyerQuestionItem(BaseModel):
    category: str
    question: str
    context: str

class DocumentAnalysisResponse(BaseModel):
    metadata: DocumentMetadata
    executive_summary: str
    key_parties: List[str]
    rights_summary: List[str]
    obligations: List[ObligationItem]
    risks: List[RiskItem]
    lawyer_checklist: List[LawyerQuestionItem]
    raw_document_id: str
    disclaimer: str ="This analysis is AI-generated for informational guidance only and does not constitute professional legal advice."

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    document_id: str
    document_text: str
    question: str
    chat_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    answer: str
    relevant_clauses: List[str] = []
    disclaimer: str = "JurisLens AI provides guidance based on the provided document text, not legal counsel."