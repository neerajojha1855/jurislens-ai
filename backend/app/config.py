import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Model configuration
GEMINI_MODEL_NAME = "gemini-2.5-flash"
MAX_UPLOAD_SIZE_MB = 15
ALLOWED_EXTENSIONS = {".pdf", ".docx"}