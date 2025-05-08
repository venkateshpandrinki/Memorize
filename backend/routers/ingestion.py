from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import get_db, spaces_table, documents_table
from services import embedding_service
from sqlalchemy.orm import Session
from sqlalchemy import select, and_  # Import 'and_' for combining WHERE clauses

router = APIRouter()

@router.post("/ingestion/{space_id}")  # Changed route path to use space_id
async def ingest_space_documents(space_id: int, db: Session = Depends(get_db)): # Changed path parameter to space_id: int
    """
    Endpoint to trigger ingestion and embedding generation for documents in a given space,
    only processing documents that are not yet embedded.
    """
    # Retrieve space from the database using space_id
    space_query = select(spaces_table).where(spaces_table.c.id == space_id) # Query by space_id
    space_result = db.execute(space_query)
    space = space_result.fetchone()
    if not space:
        raise HTTPException(status_code=404, detail=f"Space with id '{space_id}' not found") # Updated error message to refer to space_id

    # Retrieve ONLY documents for the space that are NOT yet embedded
    documents_query = select(documents_table).where(
        and_(documents_table.c.space_id == space_id, documents_table.c.is_embedded == False)  # Combined WHERE clause with 'and_'
        # Use documents_table.c.is_embedded == 0  if 'is_embedded' is stored as integer 0/1 instead of boolean
    )
    documents_result = db.execute(documents_query)
    documents = documents_result.fetchall()

    if not documents:
        return {"message": f"No **new** documents found for space with id '{space_id}' to embed.", "documents_processed": 0} # Modified message to refer to space_id

    document_texts = [doc.extracted_text for doc in documents]

    try:
        embedding_service.generate_embeddings_and_store(space_id=space_id, document_texts=document_texts) # Pass space_id to embedding_service
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating embeddings and storing in ChromaDB for space id '{space_id}': {str(e)}") # Updated error message

    # Update document status to is_embedded = True (only for the newly processed documents)
    document_ids_to_update = [doc.id for doc in documents]
    update_query = documents_table.update().where(documents_table.c.id.in_(document_ids_to_update)).values(is_embedded=True)
    db.execute(update_query)
    db.commit()

    return {
        "message": f"Ingestion and embedding generation completed for **new** documents in space with id '{space_id}'.", # Modified message
        "documents_processed": len(documents),  # Number of NEW documents processed
        "space_id": space_id, # Return space_id in response
    }