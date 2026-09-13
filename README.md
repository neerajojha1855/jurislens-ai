# JurisLens AI — Legal Document Navigator & Risk Radar

> **Vertical:** AI for Legal Assistance & Access  
> **GenAI Engine:** Google Gemini 2.5 Flash (`gemini-2.5-flash`)  
> **Challenge:** PromptWars - Virtual (Exclusive Edition)  

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB.svg)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC.svg)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4.svg)](https://deepmind.google/technologies/gemini/)

---

## ⚖️ 1. Project Description & Problem It Solves

Legal documents—contracts, employment agreements, non-disclosure agreements (NDAs), and terms of service—are intentionally verbose, opaque, and dense with legalese. For everyday consumers, freelancers, and small business owners, hiring legal counsel for every contract review is cost-prohibitive, leading many to sign agreements without understanding liabilities, unilateral termination clauses, or indemnification traps.

**JurisLens AI** bridges this access-to-justice gap by providing a smart, intuitive, and secure GenAI assistant that:
1. **Translates Complex Legalese into Plain English:** Generates high-fidelity executive summaries accessible to non-lawyers.
2. **Flags Hidden Risks with Severity Ratings:** Highlights adverse clauses (HIGH / MEDIUM / LOW severity) with direct clause citations and plain-language impact explanations.
3. **Breaks Down Rights vs. Obligations:** Clarifies who owes what, along with timelines and trigger conditions.
4. **Prepares Users for Legal Consultation:** Generates a tailored checklist of questions to bring to a licensed attorney.
5. **Enables Grounded Conversational Q&A:** Allows users to ask specific questions about the document, backed by verifiable citations.

> **Legal Disclaimer:** JurisLens AI is an informational tool designed to promote legal literacy and document clarity. It does not provide licensed legal advice or establish an attorney-client relationship.

---

## 🧠 2. GenAI Architecture & Integration Details

JurisLens AI integrates **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) via the official Google GenAI SDK (`google-genai`).

                              ┌────────────────────────┐
                              │      User Browser      │
                              │ (React + Tailwind UI)  │
                              └───────────┬────────────┘
                                          │ Multipart Upload (.pdf / .docx)
                                          │ or JSON Q&A Query
                                          ▼
                              ┌────────────────────────┐
                              │    FastAPI Backend     │
                              │      (Python 3.12)     │
                              └───────────┬────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
      ┌───────────────────────┐                       ┌───────────────────────┐
      │   Document Parser     │                       │  Session Cache Store  │
      │  pypdf & python-docx  │                       │ (In-memory, Stateless)│
      └───────────┬───────────┘                       └───────────┬───────────┘
                  │ Extracted Text + Metadata                     │ Document Text Context
                  └───────────────────────┬───────────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │     GenAI Pipeline (Gemini)     │
                         │        gemini-2.5-flash         │
                         └────────────────┬────────────────┘
                                          │
                ┌─────────────────────────┴─────────────────────────┐
                ▼                                                   ▼
  ┌───────────────────────────┐                       ┌───────────────────────────┐
  │    Structured Analysis    │                       │  Grounded Chat & Citation │
  │  - Plain English Summary  │                       │  - Document-locked Q&A    │
  │  - Risk Radar with Badges │                       │  - Direct Clause Excerpts │
  │  - Rights & Obligations   │                       │  - Suggested Prompt Flow  │
  │  - Lawyer Prep Checklist  │                       └───────────────────────────┘
  └───────────────────────────┘


### GenAI Integration Points:
1. **Document Analysis Engine (`backend/app/services/gemini.py::analyze_legal_document`)**:
   - Takes extracted text from `.pdf` or `.docx`.
   - Uses strict system directives and `response_mime_type="application/json"` to generate validated Pydantic models.
   - Temperature set to `0.2` to minimize hallucination and enforce legal fidelity.
2. **Grounded Q&A Service (`backend/app/services/gemini.py::answer_legal_question`)**:
   - Answers contextual inquiries strictly grounded within the document text.
   - Outputs direct clause citations alongside plain-English explanations.

---

## 🌟 3. Evaluation Parameters Alignment

| Submission Parameter | How JurisLens AI Excels |
|---|---|
| **Code Quality** | Clean, modular separation between FastAPI backend and React frontend. Pydantic schemas enforce type safety; components follow single-responsibility principles. |
| **Security** | 100% in-memory processing. Documents are never permanently stored on disk or leaked. Strict file validation rejects any format other than `.pdf` and `.docx`. Environment secrets (`GEMINI_API_KEY`) are protected and excluded from git. |
| **Efficiency** | Gemini 2.5 Flash provides sub-second inference and low token latency. Client-side state avoids redundant API calls. Entire repository footprint is < 2 MB, strictly respecting the < 10 MB limit. |
| **Testing** | Automated `pytest` suite tests document parsing, error handling for corrupted files, and API endpoints. |
| **Accessibility** | High-contrast WCAG-compliant slate theme, semantic HTML5 elements, ARIA labels, keyboard-navigable tabs, and mobile-responsive layout. |
| **Problem Alignment** | Fully aligned with "AI for Legal Assistance & Access" by simplifying legal documents, extracting risks, preparing users for legal professionals, and providing document-grounded Q&A. |

---

## 🚀 4. Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key ([Get one here](https://aistudio.google.com))

### Backend Setup
```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy ..\.env.example .env
# Edit .env and insert your GEMINI_API_KEY

# 5. Run tests
pytest tests/

# 6. Start backend server
uvicorn app.main:app --reload --port 8000

# 1. Open a new terminal and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
