import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Flask configurations
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    CORS_ORIGINS = ["http://localhost:3000"]  # Frontend URL

    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    ICD10_CLIENT_ID = os.getenv('ICD10_CLIENT_ID')
    ICD10_CLIENT_SECRET = os.getenv('ICD10_CLIENT_SECRET')

    # Tesseract configuration
    TESSERACT_CMD = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Windows path

    # Model configurations
    GEMINI_MODEL_ID = "gemini-pro"

    # Logging configuration
    LOG_LEVEL = "INFO"
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Allowed file extensions
    ALLOWED_EXTENSIONS = {
        'documents': ['.pdf', '.docx', '.xlsx'],
        'images': ['.png', '.jpg', '.jpeg']
    } 