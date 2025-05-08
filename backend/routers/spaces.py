from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import insert, select
from sqlalchemy.orm import Session
from database import get_db, spaces_table,documents_table
import os

router = APIRouter()

SPACES_FOLDER = "spaces"

@router.post("/createspace/")
async def create_space(space_name: str = Query(..., title="Space Name"), db: Session = Depends(get_db)):
    """Creates a new space with a given name and folder."""
    if not space_name:
        raise HTTPException(status_code=400, detail="Space name required")

    insert_stmt = insert(spaces_table).values(name=space_name)
    result = db.execute(insert_stmt)
    db.commit()
    space_id = result.inserted_primary_key[0]

    space_folder_path = os.path.join(SPACES_FOLDER, f"Space_{space_id}")
    os.makedirs(space_folder_path, exist_ok=True)

    return {"message": "Space created", "space_id": space_id, "space_name": space_name}

@router.get("/spaces/")
async def list_spaces(db: Session = Depends(get_db)):
    """Lists all available spaces."""
    select_stmt = select(spaces_table) # Select all rows from spaces_table
    result = db.execute(select_stmt)
    spaces = result.fetchall() # Fetch all results

    # Convert SQLAlchemy results to a list of dictionaries for JSON response
    space_list = []
    for space in spaces:
        space_list.append({
            "space_id": space.id, # Assuming 'id' is the column name for space ID
            "space_name": space.name # Assuming 'name' is the column name for space name
        })

    return {"spaces": space_list} # Return spaces in a dictionary

@router.get("/spaces/{space_id}/documents")
async def get_space_documents(space_id: int, db: Session = Depends(get_db)):
    """
    Get the list of document names and space name for a specific space.
    
    Args:
        space_id (int): The ID of the space to retrieve documents for.
        db (Session): Database session dependency.
    
    Returns:
        A JSON response containing the space name, space ID, and list of document names.
    """
    # Check if the space exists and get its name
    space_query = db.query(spaces_table.c.id, spaces_table.c.name).filter(spaces_table.c.id == space_id).first()
    if not space_query:
        raise HTTPException(status_code=404, detail=f"Space with ID {space_id} not found")

    space_name = space_query[1]  # Extract the space name from the query result

    # Query the documents_table for all documents with the given space_id
    query = db.query(documents_table.c.title).filter(documents_table.c.space_id == space_id)
    documents = query.all()

    # Extract just the titles from the result
    document_names = [doc[0] for doc in documents]

    # Return the space name, space ID, and list of document names
    return {
        "space_id": space_id,
        "space_name": space_name,
        "documents": document_names
    }