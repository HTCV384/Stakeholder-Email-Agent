"""
Text Extraction Utilities

Extracts text content from various file formats (PDF, HTML, TXT) for ingestion
into the stakeholder email outreach system.
"""

import os
import subprocess
from pathlib import Path
from typing import Optional
from bs4 import BeautifulSoup


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file using pdftotext utility.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Extracted text content as a string
        
    Raises:
        FileNotFoundError: If PDF file doesn't exist
        RuntimeError: If text extraction fails
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    try:
        # Use pdftotext to extract text
        result = subprocess.run(
            ['pdftotext', '-layout', pdf_path, '-'],
            capture_output=True,
            text=True,
            check=True
        )
        
        text = result.stdout
        
        # Clean up the extracted text
        text = _clean_extracted_text(text)
        
        if not text.strip():
            raise RuntimeError(f"No text extracted from PDF: {pdf_path}")
            
        return text
        
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to extract text from PDF: {e.stderr}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error extracting PDF text: {str(e)}")


def extract_text_from_html(html_path: str) -> str:
    """
    Extract text from an HTML file using BeautifulSoup.
    
    Args:
        html_path: Path to the HTML file
        
    Returns:
        Extracted text content as a string
        
    Raises:
        FileNotFoundError: If HTML file doesn't exist
        RuntimeError: If text extraction fails
    """
    if not os.path.exists(html_path):
        raise FileNotFoundError(f"HTML file not found: {html_path}")
    
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up the extracted text
        text = _clean_extracted_text(text)
        
        if not text.strip():
            raise RuntimeError(f"No text extracted from HTML: {html_path}")
            
        return text
        
    except Exception as e:
        raise RuntimeError(f"Failed to extract text from HTML: {str(e)}")


def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from a file based on its extension.
    Supports: .pdf, .html, .htm, .txt
    
    Args:
        file_path: Path to the file
        
    Returns:
        Extracted text content as a string
        
    Raises:
        ValueError: If file format is not supported
        FileNotFoundError: If file doesn't exist
        RuntimeError: If text extraction fails
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    file_ext = Path(file_path).suffix.lower()
    
    if file_ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_ext in ['.html', '.htm']:
        return extract_text_from_html(file_path)
    elif file_ext == '.txt':
        # Plain text file - just read it
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        return _clean_extracted_text(text)
    else:
        raise ValueError(
            f"Unsupported file format: {file_ext}. "
            f"Supported formats: .pdf, .html, .htm, .txt"
        )


def _clean_extracted_text(text: str) -> str:
    """
    Clean up extracted text by removing excessive whitespace and normalizing line breaks.
    
    Args:
        text: Raw extracted text
        
    Returns:
        Cleaned text
    """
    # Replace multiple spaces with single space
    lines = []
    for line in text.split('\n'):
        line = ' '.join(line.split())
        if line:  # Only keep non-empty lines
            lines.append(line)
    
    # Join lines with single newline
    cleaned = '\n'.join(lines)
    
    # Remove excessive blank lines (more than 2 consecutive)
    while '\n\n\n' in cleaned:
        cleaned = cleaned.replace('\n\n\n', '\n\n')
    
    return cleaned.strip()


def get_file_info(file_path: str) -> dict:
    """
    Get information about a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Dictionary with file information
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    path = Path(file_path)
    stat = path.stat()
    
    return {
        'filename': path.name,
        'extension': path.suffix.lower(),
        'size_bytes': stat.st_size,
        'size_mb': round(stat.st_size / (1024 * 1024), 2),
        'is_supported': path.suffix.lower() in ['.pdf', '.html', '.htm', '.txt']
    }
