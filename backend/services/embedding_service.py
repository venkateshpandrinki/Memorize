import os
from typing import List
from llama_index.core import Settings, StorageContext, VectorStoreIndex, Document,load_index_from_storage
from llama_index.core.storage.docstore import SimpleDocumentStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core.node_parser import SentenceSplitter
from pathlib import Path # Import pathlib for path manipulation


Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-base-en-v1.5", device="cuda")
def generate_embeddings_and_store(space_id: int, document_texts: List[str]):
    """
    Generates embeddings for given document texts and stores them in ChromaDB.
    Uses space_id for path and collection naming for better organization.
    """
    try:
        # 1. Setup ChromaDB client and collection
        chroma_path = Path("./chroma_db") / f"space_{space_id}" # Use pathlib for path construction
        db = chromadb.PersistentClient(path=str(chroma_path.as_posix())) # Convert to string with forward slashes
        chroma_collection_name = f"space_{space_id}_collection"
        chroma_collection = db.get_or_create_collection(chroma_collection_name)

        # 2. Initialize ChromaVectorStore and SimpleDocumentStore
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        docstore_path = Path("./index_storage") / f"space_{space_id}"/"docstore.json"
        if docstore_path.exists():
            print(f"Existing files: {os.listdir(docstore_path.parent)}")
            docstore = SimpleDocumentStore.from_persist_path(str(docstore_path.as_posix()))  # Load existing docstore
        else:
            docstore = SimpleDocumentStore()  # Create new docstore
        storage_context = StorageContext.from_defaults(docstore=docstore, vector_store=vector_store)

        # 3. Create LlamaIndex Documents and Nodes
        documents = [Document(text=text) for text in document_texts] # Create LlamaIndex Document objects
        splitter = SentenceSplitter(chunk_size=512) # Use SentenceSplitter as in your notebook
        nodes = splitter.get_nodes_from_documents(documents) # Split documents into nodes
        storage_context.docstore.add_documents(nodes)

        # 4. Create VectorStoreIndex
        index = VectorStoreIndex(
            nodes=nodes,
            storage_context=storage_context,
            show_progress=True,
            insert_batch_size=100,
            store_nodes_override=True
        )
        bm25_retriever = BM25Retriever.from_defaults(docstore=docstore)

        # 5. Persist Docstore and Index using pathlib for paths and forward slashes
        index_persist_path = Path("./index_storage") / f"space_{space_id}" # Use pathlib
        index_persist_path.mkdir(parents=True, exist_ok=True) # pathlib's mkdir for directory creation
        index.storage_context.persist(persist_dir=str(index_persist_path.as_posix()))
        



        return {"message": f"Embeddings generated and stored for space id '{space_id}'",
                "index_persist_path": str(index_persist_path.as_posix()),
                }

    except Exception as e:
        error_message = f"Error generating embeddings and storing for space id '{space_id}': {str(e)}"
        print(error_message)
        raise Exception(error_message)
    
def load_index_for_space(space_id: int):
    index_persist_path = Path("./index_storage") / f"space_{space_id}"
    docstore_path = index_persist_path / "docstore.json"
    print(f"[DEBUG - Loading] Attempting to load index from path: {str(index_persist_path.as_posix())}")
    
    try:
        # Reinitialize the vector store using the same settings as during indexing
        chroma_path = Path("./chroma_db") / f"space_{space_id}"
        db = chromadb.PersistentClient(path=str(chroma_path.as_posix()))
        chroma_collection_name = f"space_{space_id}_collection"
        chroma_collection = db.get_or_create_collection(chroma_collection_name)
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        # docstore = SimpleDocumentStore.from_persist_path(str(index_persist_path.as_posix()))
        if docstore_path.exists():
            docstore = SimpleDocumentStore.from_persist_path(str(docstore_path.as_posix()))
        else:
            docstore = SimpleDocumentStore()

        # Now pass the vector_store into the storage context when loading the index
        storage_context = StorageContext.from_defaults(
            persist_dir=str(index_persist_path.as_posix()),
            docstore=docstore,
            vector_store=vector_store
        )
        index = load_index_from_storage(storage_context)
        bm25_retriever = BM25Retriever.from_defaults(docstore=docstore,similarity_top_k=2)
        print(f"[DEBUG - Loading] Index loaded successfully from: {str(index_persist_path.as_posix())}")
        return index ,bm25_retriever
    except Exception as e:
        error_message = (f"Error loading index for space id '{space_id}' from path "
                         f"'{str(index_persist_path.as_posix())}': {str(e)}")
        print(error_message)
        raise Exception(error_message)
