from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy import insert, select
from sqlalchemy.orm import Session
import os
from database import get_db, documents_table, spaces_table
# from llama_index.readers.docling import DoclingReader
from docling.document_converter import DocumentConverter

router = APIRouter()

converter = DocumentConverter()
SPACES_FOLDER = "spaces"

@router.post("/upload/")
async def upload_file(
    space_id: int, files: list[UploadFile] = File(...), db: Session = Depends(get_db)
):
    """Uploads documents to the respective space, extracts text, and saves in DB."""
    
    # Check if space_id exists
    space_check = db.execute(spaces_table.select().where(spaces_table.c.id == space_id)).fetchone()
    if not space_check:
        raise HTTPException(status_code=404, detail="Space not found")

    space_folder = os.path.join(SPACES_FOLDER, f"Space_{space_id}")
    os.makedirs(space_folder, exist_ok=True)

    stored_files = []
    
    for file in files:
        file_path = os.path.join(space_folder, file.filename)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        # Extract text
        try:
            result = converter.convert(file_path)
            extracted_text = result.document.export_to_text()
        except Exception as e:
            extracted_text = None  # Handle extraction failure gracefully

        # Insert into DB
        insert_stmt = insert(documents_table).values(
            space_id=space_id,
            title=file.filename,
            extracted_text=extracted_text
        )
        db.execute(insert_stmt)
        db.commit()

        stored_files.append({"filename": file.filename, "extracted": bool(extracted_text)})

    return {"message": "Files uploaded", "files": stored_files}