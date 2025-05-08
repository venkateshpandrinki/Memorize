from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import embedding_service
from llama_index.core import Settings
from llama_index.llms.gemini import Gemini
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import QueryFusionRetriever
from llama_index.retrievers.bm25 import BM25Retriever
import Stemmer
import nest_asyncio



import os
from dotenv import load_dotenv
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
Settings.llm = Gemini(model="models/gemini-1.5-flash")
router = APIRouter()

class QueryRequest(BaseModel):
    query_text: str

@router.post("/query/{space_id}")
async def query_space(space_id: str, request: QueryRequest):  # Expect request body as Pydantic model
    try:
        # Convert space_id to integer if needed by the embedding_service
        index,bm25_retriever = embedding_service.load_index_for_space(int(space_id))
        retriever = QueryFusionRetriever(
            [
                index.as_retriever(similarity_top_k=5),
                bm25_retriever
            ],
            similarity_top_k=2,
            num_queries=1,
            mode="reciprocal_rerank",
            use_async=True,
            verbose=True,)
        nest_asyncio.apply()
        # query_engine = index.as_query_engine()
        query_engine = RetrieverQueryEngine.from_args(retriever)
        response = query_engine.query(request.query_text)
        print(response)
        return {"response": str(response)}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error querying space '{space_id}': {str(e)}"
        )
