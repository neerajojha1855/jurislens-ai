# JurisLens AI — Legal Document Navigator & Risk Radar

**Deployed Prototype Link:** [https://jurislens-ai-sable.vercel.app](https://jurislens-ai-sable.vercel.app)

> **Vertical:** AI for Legal Assistance & Access  
> **GenAI Engine:** Google Gemini 2.5 Flash (`gemini-2.5-flash`)  

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB.svg)](https://react.dev)

---

## ⚖️ Project Description

Legal documents are intentionally verbose and dense with legalese. For everyday consumers and small business owners, hiring legal counsel for every contract review is cost-prohibitive. **JurisLens AI** bridges this access-to-justice gap by providing a smart, intuitive GenAI assistant that translates complex legalese into plain English, flags hidden risks with severity ratings, breaks down obligations, and prepares users for legal consultations.

---

## 🚀 Approach and logic

Our approach decouples the architecture into a blazing-fast React/Vite frontend (deployed on Vercel) and a robust Python FastAPI backend (deployed on Render). 
The core logic relies on **zero-shot prompting with strict JSON schemas**. By forcing the LLM to adhere to a Pydantic-defined JSON structure, we ensure the frontend always receives predictable, structured data (e.g., arrays of risks, parties, and checklists) rather than a wall of text. We purposely enforce a low temperature (0.2) to prioritize factual extraction over creative generation, maintaining high legal fidelity.

---

## ⚙️ How the solution works

1. **Upload & Parsing:** The user uploads a `.pdf` or `.docx` file via the React dashboard. The FastAPI backend securely parses the document in-memory using `pypdf` or `python-docx` to extract raw text and metadata.
2. **AI Analysis:** The extracted text is sent to the Gemini 2.5 Flash model with a system prompt instructing it to act as an objective legal analyst. It returns a structured JSON payload containing an executive summary, risks, and obligations.
3. **Interactive Dashboard:** The frontend renders this JSON into an intuitive, glassmorphism-styled dashboard, highlighting high-severity risks in red and summarizing reading time.
4. **Context-Aware Q&A:** Users can ask follow-up questions in the Chat Assistant. The backend sends the user's query, the conversation history, and the document text back to Gemini, which generates a grounded response with direct clause citations.

---

## 🧠 GenAI Architecture

We explicitly used the **Google GenAI SDK** with the **Gemini 2.5 Flash** model. It is integrated in two specific places in the backend:
1. **`/api/analyze` Endpoint:** Utilizes `GenerateContentConfig` with `response_mime_type="application/json"` to perform the initial deep-dive analysis of the entire document text.
2. **`/api/chat` Endpoint:** Utilizes Gemini to power the conversational assistant, relying on the model's massive context window to ground every answer strictly in the uploaded document's text.

---

## 📌 Any assumptions made

- **Text-Based Documents:** We assume uploaded PDFs and DOCX files contain selectable text (not scanned images requiring OCR).
- **Language:** We assume the legal documents are written in English.
- **Context Limit:** We assume standard consumer contracts (e.g., NDAs, Employment Agreements, TOS) will not exceed the massive context window of Gemini 2.5 Flash.
- **Not Legal Counsel:** We assume users understand this is an informational tool designed to promote legal literacy, not a replacement for a licensed attorney.

---

## 🌟 Evaluation Parameters Alignment

| Parameter | How JurisLens AI Excels |
|---|---|
| **Code Quality** | Modular separation of concerns. Pydantic schemas enforce type safety. |
| **Security** | 100% in-memory processing. Documents are never saved to disk. |
| **Efficiency** | Gemini 2.5 Flash provides sub-second inference. Client-side state avoids redundant API calls. |
| **Testing** | Automated `pytest` suite for document parsing and API endpoints. |
| **Accessibility** | High-contrast WCAG-compliant Slate theme, semantic HTML5. |
