from routers import spaces,upload,ingestion,query,podcast
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
app = FastAPI()

origins = [
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(spaces.router)
app.include_router(upload.router)
app.include_router(ingestion.router)
app.include_router(query.router)
app.include_router(podcast.router)
app.mount("/podcasts", StaticFiles(directory="podcasts"), name="podcasts")