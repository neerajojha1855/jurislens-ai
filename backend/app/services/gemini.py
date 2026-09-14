import json
from google import genai
from google.genai import types
from app.config import GEMINI_API_KEY, GEMINI_MODEL_NAME
from app.models.schemas import DocumentAnalysisResponse, DocumentMetadata, ChatResponse, ChatRequest

def get_gemini_client():
    if not GEMINI_API_KEY:
        raise ValueError("Key is not configured in backend environment.")
    
    return genai.Client(api_key=GEMINI_API_KEY)

ANALYSIS_SYSTEM_PROMPT = """
You are JurisLens AI, an elite legal document intelligence assistant.
Your goal is to empower everyday users, consumers, freelancers and 
small business owners to understand complex agreements, contracts and policies.

Critical Directions:
1. Explain in clear, approachable plain english while presenting legal nuance.
2. identify critical risks with high precision (e.g. unilaterrsl termination, indemification traps, auto-renewals, non-competes, IP forfeiture).
3. Do not invent facts: only analyze what is in the document.
4. Output MUST conform strictly to the specified JSON schema.
5. Emphasize that this is informational assistance, not formal legal counsel.
"""

def analyze_legal_document(document_id: str, document_text: str, metadata: DocumentMetadata) -> DocumentAnalysisResponse:
    # Invokes Gemini 2.5 Flash to generate structured legal analysis.
    client = get_gemini_client()
    prompt = f"""
    Analyze the following leggal document and extract structured insights.
    
    Document METADATA:
    - File Name: {metadata.filename}
    - File Type: {metadata.file_type}

    Document CONTENT:
    {document_text[:60000]}

    Return a valid JSON object matching this schema:
    {{
        "executive_summary": "High-level summary in 3-4 sentences in clear plain english",
        "key_parties": ["Party 1 name/role", "Party 2 name/role"],
        "rights_summary": ["Key right 1 granted to user", "Key right 2 granted to user"],
        "obligations": [
            {{
                "party": "Party Name / You",
                "obligation_text": "What they must do or avoid doing",
                "deadline_or_condition": "Timeline or condition (if specified)"
            }}
        ],
        "risks": [
            {{
                "severity": "HIGH | MEDIUM | LOW",
                "title": "Clear consise risk title",
                "clause_quote": "Exact or near-exact short quote from text",
                "plain_explanation": "Why this hurts the user in plain terms",
                "recommendation": "What to ask or negotiate"
            }}
        ],
        "lawyer_checklist": [
            {{
                "category": "e.g. Liability / Payment / Termination",
                "question": "Specfic question the user should ask their attorney",
                "context": "Why this question is necessary"
            }}
        ]
    }}
    """

    response = client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=prompt, 
        config=types.GenerateContentConfig(
            system_instruction=ANALYSIS_SYSTEM_PROMPT,
            response_mime_type="application/json",
            temperature=0.2
        )
    )
    result_data = json.loads(response.text)

    return DocumentAnalysisResponse(
        metadata=metadata,
        executive_summary=result_data.get("executive_summary", "No summary generated."),
        key_parties=result_data.get("key_parties", []),
        rights_summary=result_data.get("rights_summary", []),
        obligations=result_data.get("obligations", []),
        risks=result_data.get("risks", []),
        lawyer_checklist=result_data.get("lawyer_checklist", []),
        raw_document_id=document_id
    )

def answer_legal_question(request: ChatRequest) -> ChatResponse:
    # Answers user queries grounded strictly within the document text
    client = get_gemini_client()
    conversation_context = ""

    if request.chat_history:
        for msg in request.chat_history[-6:]:
            conversation_context += f"{msg.role.upper()}: {msg.content}\n"
    
    prompt = f"""
    You are JurisLens AI answering a question regarding the following legal document:

    Dcoument CONTEXT:
    {request.document_text[:50000]}

    Prior Conversation:
    {conversation_context}

    User Question:
    {request.question}

    Instructions:
    1. Ground your answer strictly in the text provided.
    2. If the document does not contain the answer, explicitly state so.
    3. Quote or cite relevant clauses or sections wherever possible.
    4. Keep the explanation accessible, clear and objective.
    5. Return a JSON object with:
        - "answer": Plain english answer to the user's question
        - "relevant_clauses": [List of short quotes from the document supporting the answer]
    """

    response = client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instructions="You are JurisLens AI an objective legal assistant.",
            response_mime_type="application/json",
            temperature=0.2
        )
    )

    data = json.loads(response.text)

    return ChatResponse(
        answer=data.get("answer", "Unable to find a relevant clause in the document."),
        relevant_clauses=data.get("relevant_clauses", [])
    )