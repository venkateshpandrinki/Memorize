from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, ForeignKey, Text, Boolean # Import Text and Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "sqlite:///./memorize.db"
engine = create_engine(DATABASE_URL)
metadata = MetaData()

spaces_table = Table(
    "spaces",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("name", String, nullable=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now())
)

documents_table = Table(
    "documents",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("space_id", Integer, ForeignKey("spaces.id"), nullable=False),
    Column("title", String, nullable=False),
    Column("extracted_text", Text),  # Changed to Text
    Column("uploaded_at", DateTime(timezone=True), server_default=func.now()),
    Column("is_embedded", Boolean, server_default='0')
)

podcasts_table = Table( # Optional
    "podcasts",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("space_id", Integer, ForeignKey("spaces.id"), nullable=False),
    Column("transcript", Text), # Changed to Text - also good for transcripts
    Column("audio_path", String),
    Column("created_at", DateTime(timezone=True), server_default=func.now())
)

metadata.create_all(engine)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()