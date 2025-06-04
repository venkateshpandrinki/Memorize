# Memorize: AI Powered Knowledge Assistant 🧠📚🎧


![Opera Snapshot_2025-05-08_161341_localhost](https://github.com/user-attachments/assets/3827915f-569d-424e-9230-3c198b15e8eb)

## Overview

In an era of information overload, **Memorize: AI Powered Knowledge Assistant** emerges as a transformative solution, addressing the challenges learners and researchers face in efficiently processing and comprehending complex academic materials. This project is an AI-powered knowledge assistant designed to convert static documents (PDFs, PPTs, Word files) into interactive and spoken content, enhancing accessibility and understanding.

At its core, Memorize integrates a sophisticated multi-modal document ingestion system, a hybrid Retrieval Augmented Generation (RAG) framework, and an innovative AI-driven chapter-to-podcast generator. By combining dense and sparse retrieval with re-ranking, the RAG component significantly improves query accuracy and mitigates hallucination when generating answers using the Gemini LLM. The podcast generator further revolutionizes learning by creating structured audio content from chapter text, utilizing role-based summarization and a debate-style script, catering to diverse learning styles.

## Features

- ✨ **Multi-Format Document Ingestion:** Seamlessly upload and parse content from PDF, PowerPoint, and Word files.
- 🔍 **Advanced RAG-Based Information Retrieval:** Leverage a powerful RAG framework incorporating **Hybrid Search**, **RAG Fusion**, and **Reciprocal Rank Fusion** to combine lexical (BM25) and semantic (embedding-based) search techniques for highly relevant and accurate information retrieval.
- 🗣️ **Conversational AI Response:** Interact with an intelligent chatbot powered by Google's Gemini LLM, providing accurate and context-aware answers grounded in your documents.
- 🎙️ **AI-Driven Podcast Generation (Multistep Workflow):** Transform selected document chapters into engaging, debate-style podcast scripts through a **multistep workflow** including outline generation, role-based summarization, and dialogue creation, synthesized into natural-sounding audio using Kokoro TTS.
- 🌐 **Intuitive Web Interface:** A user-friendly frontend for easy document management, querying, and audio playback.
- ⚡ **Optimized Performance:** GPU-accelerated processing for fast ingestion and low-latency text-to-speech generation.
- 🔒 **Robust Security:** Secure endpoints with authentication and access control to protect user data and documents.

## Sample Outputs
![Opera Snapshot_2025-05-08_161435_localhost](https://github.com/user-attachments/assets/284dc471-7e79-4242-8565-dc7caeb81b49)
![Opera Snapshot_2025-05-08_161516_localhost](https://github.com/user-attachments/assets/da00d65f-5bc8-4058-88ed-1e3f49be51a5)


## Problem Statement

Learners and researchers are often overwhelmed by the sheer volume and density of academic papers, reports, and technical documentation. Traditional methods of consumption (manual reading, note-taking) are inefficient, time-consuming, and fail to scale with the influx of digital information. Furthermore, static document formats like PDFs and PPTs are not optimized for dynamic interaction, semantic understanding, or integration into modern knowledge management systems, creating a significant barrier to knowledge accessibility and engagement.

## Proposed Solution

Memorize proposes an end-to-end AI-powered knowledge assistant that intelligently ingests, processes, and transforms documents into interactive, voice-enabled, and context-aware knowledge formats. This system aims to create a more intuitive and engaging experience by converting static documents into dynamic formats that support alternative learning modalities, such as podcasts, while ensuring accurate and meaningful information retrieval.

## System Architecture

The system is designed with a modular and scalable architecture, comprising four major layers that communicate via RESTful APIs and real-time channels.
### Module 1 Architecture
![module1arch](https://github.com/user-attachments/assets/15b6993c-eb48-45c0-8374-51c089e2d88a)

### Module 2 Architecture
![module2arch](https://github.com/user-attachments/assets/18fbbbf2-788d-46ec-8a3c-6875cbbb47d5)


### Folder Structure

```
.
├── backend
│  ├── routers
│  │  ├── ingestion.py
│  │  ├── podcast.py
│  │  ├── query.py
│  │  ├── spaces.py
│  │  └── upload.py
│  ├── services
│  │  ├── embedding_service.py
│  │  └── podcast_audio_generator.py
│  ├── database.py
│  ├── main.py
│  ├── memorize.db
│  └── requirements.txt
├── frontend
│  ├── public
│  │  ├── file.svg
│  │  ├── globe.svg
│  │  ├── next.svg
│  │  ├── vercel.svg
│  │  └── window.svg
│  ├── src
│  │  ├── app
│  │  │  ├── spaces
│  │  │  │  ├── [id]
│  │  │  │  │  └── page.tsx
│  │  │  │  └── page.tsx
│  │  │  ├── favicon.ico
│  │  │  ├── globals.css
│  │  │  ├── layout.tsx
│  │  │  └── page.tsx
│  │  └── components
│  │     ├── ui
│  │     │  ├── button.tsx
│  │     │  ├── card.tsx
│  │     │  ├── dialog.tsx
│  │     │  ├── input.tsx
│  │     │  ├── label.tsx
│  │     │  ├── separator.tsx
│  │     │  └── sonner.tsx
│  │     ├── Chatpanel.tsx
│  │     ├── QueryProvider.tsx
│  │     ├── SourcesPanel.tsx
│  │     ├── Studiopanel.tsx
│  │     ├── theme-provider.tsx
│  │     ├── theme-toggle.tsx
│  │     └── Uploadmodal.tsx
│  ├── .gitignore
│  ├── components.json
│  ├── eslint.config.mjs
│  ├── next.config.ts
│  ├── package-lock.json
│  ├── package.json
│  ├── pnpm-lock.yaml
│  ├── postcss.config.mjs
│  ├── README.md
│  ├── tailwind.config.ts
│  └── tsconfig.json
└── .gitignore

```

### Backend Layer (API & Orchestration)

* **Technology:** Python with FastAPI
* **Responsibilities:** Handles API endpoints for document upload, ingestion, querying, and podcast generation. Coordinates between document parser, vector store, Gemini LLM, and TTS engine, managing user sessions and task queues.

### Frontend Layer (Client Interface)

* **Technology:** Next.js 14, React Query, Tailwind CSS
* **Functions:** Provides user registration, document upload UI, conversational chat interface, chapter selection, podcast playback, and visual feedback on query results.

### Processing Layer (AI & NLP Pipeline)

* **Components:**
    * **Document Parser:** Utilizes Docling for structured text and metadata extraction.
    * **Embedding Engine:** Generates dense embeddings using HuggingFace models.
    * **Hybrid RAG Module:** Combines sparse retrieval (BM25) and dense retrieval (ChromaDB) with **RAG Fusion** and **Reciprocal Rank Fusion** for re-ranking.
    * **LLM Interaction:** Leverages Google's Gemini API for summarization, Q&A, and podcast script generation.
    * **TTS Engine:** Integrates Kokoro TTS for high-quality audio synthesis, as part of the podcast generation workflow.

### Data Storage Layer

* **Document Storage:** Parsed documents are stored in SQLite for lightweight querying. Embedded vectors are stored in ChromaDB for semantic search.
* **Audio Storage:** Generated podcast files are stored locally or in cloud storage, with metadata indexed for playback and retrieval.

## Technologies Used

* **Backend:**
    * Python 3.10+
    * FastAPI
    * SQLite
    * LlamaIndex (for data orchestration)
    * HuggingFace Transformers
    * ChromaDB (for vector embeddings)
    * Docling (for document parsing)
    * Google Gemini API (for LLM interactions)
    * Kokoro TTS (for Text-to-Speech synthesis)
    * CUDA toolkit (for GPU acceleration)
* **Frontend:**
    * Next.js 14
    * React Query
    * Tailwind CSS
    * Axios
    * Framer Motion
    * React Dropzone
    * ShadCN/UI Components

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

* Python 3.10 or higher
* Node.js (LTS version recommended)
* npm or yarn
* Git
* (Optional) NVIDIA GPU with CUDA support for accelerated embeddings and TTS.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/memorize-ai-assistant.git](https://github.com/your-username/memorize-ai-assistant.git)
    cd Memorize
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    pip install -r requirements.txt
    # If you have a GPU, ensure CUDA is properly configured for relevant libraries.
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install # or yarn install
    ```


4.  **Environment Variables:**
    Create a `.env` file in the `backend` directory and add your Google Gemini API key:
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```
    (Note: For local development, you might need to set up a local ChromaDB instance or configure it to use an in-memory client for quick testing.)

### Running the Application

1.  **Start the Backend Server:**
    Navigate to the `backend` directory and run:
    ```bash
    uvicorn app.main:app --reload --port 8001
    ```
    The backend will be accessible at `http://localhost:8001`.

2.  **Start the Frontend Development Server:**
    Navigate to the `frontend` directory and run:
    ```bash
    npm run dev # or yarn dev
    ```
    The frontend will be accessible at `http://localhost:3000`.

Now you can open your browser and navigate to `http://localhost:3000` to start using Memorize!

## Contributing

We welcome contributions! If you have suggestions for improvements, new features, or bug fixes, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

