<div align="center">

# ⚡ Gitfolio

**Transform your GitHub into a job-ready, recruiter-approved portfolio in under 60 seconds.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![Groq AI](https://img.shields.io/badge/Powered%20By-Groq%20Llama%203-f55036.svg)](https://groq.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

[Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Configuration](#-environment-variables)

</div>

---

## 📖 Overview

**Gitfolio** is an AI-powered GitHub profile intelligence platform built for both **software engineers** looking to optimize their portfolio and **technical recruiters** screening engineering talent.

By combining deep GitHub tree and repository analysis with fast LLM evaluation powered by Groq, Gitfolio eliminates guesswork from developer assessment. It audits codebases, inspects frameworks, measures production signals (CI/CD, Docker, tests, commits, and documentation), and benchmarks profiles against real-world job requirements.

---

## 🚀 Key Features

### 🎓 For Developers & Students
- **📊 ATS Portfolio Scoring & AI Feedback**: Audits commit velocity, documentation quality, tech stack breadth, and repo depth. Calculates a 0–100 ATS readiness score with actionable recruiter-grade improvement steps.
- **🎯 Specialization Fit Analysis**: Evaluates your GitHub footprint against **19+ target roles** (e.g., *SDE (FAANG)*, *Backend Engineer*, *Frontend Engineer*, *MLOps*, *DevOps*, etc.) or custom Job Descriptions. Visualizes skill radar charts, hiring readiness, missing signals, and a personalized learning roadmap.
- **📄 Resume vs. GitHub Verifier**: Upload your resume (`.pdf`, `.docx`, `.txt`) alongside your GitHub handle. The engine verifies claimed competencies against actual shipped code, detects exaggerated claims, and highlights uncredited skills found in your repos.

### 👔 For Recruiters & Hiring Managers
- **⚔️ GitHub Profile Compare**: Head-to-head comparison of two GitHub profiles. Evaluates code volume, consistency, architecture maturity, and repository quality with an automated AI winner verdict.
- **📑 Bulk Candidate Shortlisting**: Upload an Excel spreadsheet (`.xlsx`) containing candidate details and GitHub handles. The system automatically inspects all profiles in parallel with bounded concurrency, scores them against the Job Description, and generates a ranked candidate shortlist.

---

## 🏗️ Architecture & System Flow

Gitfolio is designed with a **cloud-native, two-tier decoupled architecture**. The frontend is deployed as an edge-optimized SPA on **Vercel**, while the backend runs as a high-performance, asynchronous service on **Render**.

### 1. High-Level System Architecture

```mermaid
flowchart TD
    %% Styling Definitions
    classDef clientStyle fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#fff
    classDef apiStyle fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#fff
    classDef processStyle fill:#1e1e38,stroke:#a855f7,stroke-width:2px,color:#fff
    classDef aiStyle fill:#2d1b4e,stroke:#ec4899,stroke-width:2px,color:#fff
    classDef extStyle fill:#18181b,stroke:#f59e0b,stroke-width:2px,color:#fff

    subgraph CLIENT["🎨 Frontend Layer (Vercel)"]
        UI["React 19 + Vite SPA<br/>(Tailwind CSS v4 + Framer Motion)"]
        subgraph MODULES["Application Feature Views"]
            M1["📊 ATS Portfolio Scoring"]
            M2["🎯 Specialization Fit (19+ Roles)"]
            M3["⚔️ Profile Comparison (A vs B)"]
            M4["📑 Bulk Candidate Shortlist"]
            M5["📄 Resume vs GitHub Match"]
        end
    end

    subgraph GATEWAY["⚡ Unified Backend Layer (Render)"]
        API["FastAPI Async Gateway (Port 8000)<br/>CORS • Error Handling • Pydantic Validation"]
        CACHE[("In-Memory Monotonic Cache<br/>(TTL Deduplication & Rate Cushion)")]
        
        subgraph ROUTES["REST API Endpoints"]
            R1["/api/github/analyze"]
            R2["/api/specialization/*"]
            R3["/api/github-compare/*"]
            R4["/api/resume-match/*"]
            R5["/api/shortlist/*"]
        end
    end

    subgraph INGESTION["⚙️ Ingestion & Parsing Services"]
        GH_SVC["Async GitHub Deep Analyzer<br/>• Recursive Tree Inspection<br/>• Manifest Parsing (package.json, pyproject)<br/>• Framework & Architecture Signals<br/>• Commit Velocity & README Sanitizer"]
        DOC_SVC["Document & Spreadsheet Processors<br/>• pdfplumber (PDF Resumes)<br/>• python-docx (Word Documents)<br/>• openpyxl (Candidate Worksheets)"]
    end

    subgraph AI["🧠 Scoring & Intelligence Core"]
        SCORING["Heuristic Scoring Engine<br/>• Category Weights<br/>• Production Readiness Matrix"]
        PROMPT["Structured Prompt Synthesizer<br/>(Few-Shot Engineering Persona Context)"]
        GROQ_CLIENT["Groq Inference Engine<br/>(Llama 3 70B / 8B Models)"]
    end

    subgraph CLOUD["🌐 External APIs & Providers"]
        GH_API["GitHub REST API v3<br/>(Profiles, Repos, Commits, Trees)"]
        GROQ_API["Groq Cloud AI<br/>(Ultra-Low Latency LLM Processing)"]
    end

    %% Data Connections
    UI -->|"HTTP REST / JSON / Multipart"| API
    API --> CACHE
    API --> ROUTES

    R1 & R2 & R3 --> GH_SVC
    R4 & R5 --> DOC_SVC
    DOC_SVC --> GH_SVC

    GH_SVC -->|"Async HTTPX (Bearer Auth)"| GH_API
    GH_API -.->|"Repos, Trees, Commits"| GH_SVC

    GH_SVC --> SCORING
    SCORING --> PROMPT
    PROMPT --> GROQ_CLIENT

    GROQ_CLIENT -->|"Streaming / Completion"| GROQ_API
    GROQ_API -.->|"Structured Insights & Verdicts"| GROQ_CLIENT

    GROQ_CLIENT -.->|"Evaluated Metrics & Radar Scores"| API
    API -.->|"JSON Response Payload"| UI

    class UI,M1,M2,M3,M4,M5 clientStyle
    class API,CACHE,R1,R2,R3,R4,R5 apiStyle
    class GH_SVC,DOC_SVC processStyle
    class SCORING,PROMPT,GROQ_CLIENT aiStyle
    class GH_API,GROQ_API extStyle
```

---

### 2. End-to-End Analysis Pipeline

```mermaid
flowchart LR
    %% Data Pipeline Steps
    Step1(["1. Input"]) --> Step2{"2. Cache Check"}
    Step2 -- "Hit" --> Step6(["6. Client Response"])
    Step2 -- "Miss" --> Step3["3. Async GitHub Fan-out"]
    Step3 --> Step4["4. Deep Signal Extraction"]
    Step4 --> Step5["5. AI LLM Synthesis"]
    Step5 --> Step6

    subgraph Step1_Details["Step 1: User Action"]
        S1A["Username / Profile URL"]
        S1B["Resume (.pdf / .docx)"]
        S1C["Job Description / Role ID"]
    end

    subgraph Step4_Details["Step 4: Heuristics & Signals"]
        S4A["CI/CD Detection (.github/workflows)"]
        S4B["Docker / Containerization Signals"]
        S4C["Test Coverage Indicators"]
        S4D["Language & Framework Diversity"]
    end

    subgraph Step5_Details["Step 5: Groq Intelligence"]
        S5A["Benchmark vs 19+ Role Archetypes"]
        S5B["Radar Axis Calculation (0–100)"]
        S5C["Actionable Improvement Roadmap"]
    end

    Step1 -.-> Step1_Details
    Step4 -.-> Step4_Details
    Step5 -.-> Step5_Details
```

### Tech Stack Breakdown
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, Axios, React Icons.
- **Backend**: FastAPI, Uvicorn, Pydantic v2, HTTPX (async client), Groq Python SDK.
- **File Parsing & Utilities**: `pdfplumber` (PDFs), `python-docx` (Word), `openpyxl` (Excel spreadsheets), in-memory TTL caching.

---

## 📂 Project Structure

```
Github-Project/
├── Frontend/                 # React 19 + Vite Single-Page Application
│   ├── src/
│   │   ├── components/       # Reusable UI components & layouts
│   │   ├── features/         # Feature hooks (compare, shortlist, specialization, resume)
│   │   ├── pages/            # Student & Recruiter views
│   │   ├── services/         # Axios API client (/api/* endpoints)
│   │   └── App.jsx           # Main routing & state
│   ├── vite.config.js        # Vite dev server configuration with /api proxy
│   └── package.json
│
├── Backend/                  # Unified FastAPI Application
│   ├── api/
│   │   └── routes/           # Public API routers (/api/github, /api/shortlist, etc.)
│   ├── services/             # Core business logic (GitHub deep analyzer, shortlist batcher)
│   ├── specialization/       # Role registries (19+ tech tracks) & fit analyzers
│   ├── resume_match/         # Resume extraction & cross-reference engine
│   ├── github_compare/       # Candidate comparison orchestration
│   ├── shortlist/            # Bulk candidate shortlisting engine
│   ├── utils/                # In-memory TTL cache, sanitizers, username & file parsers
│   ├── tests/                # Automated pytest suite (unit, route, e2e)
│   ├── main.py               # FastAPI entry point, CORS, routers & exception handlers
│   └── requirements.txt      # Python dependencies
│
├── package.json              # Root orchestration scripts (concurrent runner)
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **uv** (recommended) or **pip**

### 1. Clone the Repository
```bash
git clone https://github.com/ArmanSunasara/Gitfolio.git
cd Gitfolio
```

### 2. Configure Environment Variables

#### Backend (`Backend/.env`)
Create a `.env` file in the `Backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_personal_access_token_here
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000
```
> **Tip**: A `GITHUB_TOKEN` is recommended to increase the GitHub API rate limit from 60 to 5,000 requests per hour. You can generate a free token at [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens).

#### Frontend (`Frontend/.env`)
Create a `.env` file in the `Frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Install Dependencies

#### Install Root & Frontend Dependencies:
```bash
npm install
npm run install:frontend
```

#### Install Backend Python Dependencies:
```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```
*(Or with `uv`)*:
```bash
cd Backend && uv pip install -r requirements.txt --python .venv/bin/python && cd ..
```

---

## 🚦 Running the Application

### Option A: Run Both Concurrently (Recommended)
From the project root:
```bash
npm start
```
This runs:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Run Services Individually

**Start the Backend**:
```bash
npm run backend
# or: cd Backend && ./.venv/bin/uvicorn main:app --reload --port 8000
```

**Start the Frontend**:
```bash
npm run frontend
# or: cd Frontend && npm run dev
```

---

## 🧪 Testing

The backend includes a comprehensive automated test suite with **18 unit, route, and end-to-end integration tests**:

```bash
cd Backend
./.venv/bin/pytest tests/ -v
```

To run a production frontend build check:
```bash
cd Frontend
npm run build
```

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Service health status. |
| `/api/github/analyze` | `POST` | Deep portfolio analysis, commit velocity & ATS score for a GitHub handle. |
| `/api/github-compare/analyze` | `POST` | Side-by-side comparative analysis of two profiles. |
| `/api/resume-match/analyze` | `POST` | Multipart upload matching resume (`.pdf`, `.docx`, `.txt`) against GitHub activity. |
| `/api/specialization/roles` | `GET` | Returns all available specialized role profiles (19 tracks). |
| `/api/specialization/analyze` | `POST` | Evaluates GitHub profile against a specific role or custom Job Description. |
| `/api/shortlist/analyze` | `POST` | Multipart upload parsing candidate spreadsheet (`.xlsx`) and ranking against a JD. |

---

## 🛡️ License

This project is licensed under the **ISC License**.