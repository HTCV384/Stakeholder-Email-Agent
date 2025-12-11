"""
PDF Text Extraction Utility
"""
import requests
from pypdf import PdfReader
from io import BytesIO
import subprocess
import tempfile
import os
from bs4 import BeautifulSoup


def _is_garbled_text(text: str) -> bool:
    """
    Check if extracted text contains too many garbled/special characters.
    Looks for actual English words to determine if text is readable.
    """
    if not text or len(text) < 50:
        return True
    
    # Check for common English words
    sample = text[:2000].lower()
    common_words = ['the', 'and', 'of', 'to', 'in', 'is', 'for', 'on', 'with', 'as', 'at', 'by']
    word_count = sum(1 for word in common_words if f' {word} ' in sample or sample.startswith(f'{word} '))
    
    # If we find at least 3 common English words, it's probably readable
    if word_count >= 3:
        return False
    
    # Check for excessive special characters or encoding artifacts
    special_chars = sum(1 for c in text[:1000] if c in '/\\ÿ' or ord(c) > 127)
    return special_chars > 100  # More than 10% special chars in first 1000 chars


def extract_text_from_pdf_url(url: str) -> str:
    """
    Download a PDF from a URL and extract all text content.
    Uses multiple extraction methods and falls back if text is garbled.
    
    Args:
        url: URL to the PDF file
        
    Returns:
        Extracted text content as a string
        
    Raises:
        Exception: If download or extraction fails
    """
    try:
        # Download the PDF
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Save to temporary file for pdftotext
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
            tmp_file.write(response.content)
            tmp_path = tmp_file.name
        
        try:
            # Method 1: Try pypdf first
            pdf_file = BytesIO(response.content)
            reader = PdfReader(pdf_file)
            
            text_content = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_content.append(text)
            
            full_text = "\n\n".join(text_content)
            
            # Check if text is garbled
            if not _is_garbled_text(full_text) and full_text.strip():
                return full_text
            
            # Method 2: Fall back to pdftotext command-line tool
            print("[PDF Extractor] pypdf produced garbled text, trying pdftotext...")
            result = subprocess.run(
                ['pdftotext', '-layout', tmp_path, '-'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0 and result.stdout.strip():
                # pdftotext output may still have some encoding issues but is usually better
                return result.stdout
            
            # If both methods fail, return the pypdf output anyway
            if full_text.strip():
                print("[PDF Extractor] WARNING: Text may be garbled")
                return full_text
            
            raise ValueError("No text content extracted from PDF")
            
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except:
                pass
        
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_html_url(url: str) -> str:
    """
    Download HTML from a URL and extract clean text content.
    Uses BeautifulSoup to strip HTML tags and extract readable text.
    
    Args:
        url: URL to the HTML file
        
    Returns:
        Clean text content extracted from HTML
        
    Raises:
        Exception: If download fails
    """
    try:
        from bs4 import BeautifulSoup
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Parse HTML and extract text
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text and clean up whitespace
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
    except Exception as e:
        raise Exception(f"Failed to download/parse HTML: {str(e)}")
