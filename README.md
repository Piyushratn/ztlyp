<div align="center">

# Wind Forecast Monitor 🌬️⚡

### Decision Support Dashboard for UK Power Purchasing

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br/>

**[🔗 Live Demo](https://insert-your-vercel-url-here.vercel.app/) · [🎥 Video Walkthrough](https://insert-your-unlisted-youtube-link-here) · [🐛 Report Bug](#) · [✨ Request Feature](#)**

</div>

---

## 📌 The Problem

> UK energy utilities must buy electricity from the day-ahead wholesale market to meet consumer demand. Because wind generation is weather-dependent, purchasing decisions are made **one day in advance** based on forecasts. If wind is over-forecasted, the grid faces a critical shortfall, requiring expensive last-minute thermal generation to avoid blackouts.

**Wind Forecast Monitor solves this** by giving trading teams a clear, deterministic view of the latest valid forecasts prior to their decision cutoff, alongside quantified historical error margins to accurately calculate required thermal buffers.

---

## 📊 Impact & Scope

<div align="center">

| 🌐 Target Market | 📡 Data Source | ⏱️ Decision Cutoff | ⚡ Risk Mitigated | 🤖 AI Assisted |
|:---:|:---:|:---:|:---:|:---:|
| **UK Energy Utilities** | **Elexon BMRS** | **D-1 @ 09:00 UTC** | **Grid Shortfalls** | **Yes** |

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⏱️ **Strict Cutoff Enforcement** | Automatically filters out any forecast published after D-1 09:00 UTC. |
| 🛡️ **Zero Data Leakage** | Uncertainty bands (P10/P90) are calculated *exclusively* using errors from prior days. |
| 📊 **KPI Tracking** | Real-time calculation of Normalized MAE, Bias, and Over-Forecast Share. |
| 🔥 **Thermal Buffer Alerts** | Recommends exact standby Megawatts needed to cover 90% of historical shortfall scenarios. |
| ⚡ **Immutable Snapshots** | Data pipeline pre-fetches BMRS data to ensure the dashboard never goes down during trading hours. |
| 🐳 **Fully Containerized** | One-command local spin-up via Docker Compose. |

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────┐
│                       USER INTERFACE                       │
│           React + Vite + Tailwind CSS + Recharts           │
│  [ KPI Cards ] [ Forecast vs Actuals ] [ Thermal Buffer ]  │
└─────────────────────────────┬──────────────────────────────┘
                              │ HTTP GET /api/decision-view
                              ▼
┌────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                       │
│    • Enforces D-1 09:00 UTC cutoff                         │
│    • Calculates P10/P90 error bands (Zero Data Leakage)    │
│    • Computes MAE, Bias, and Thermal Buffer metrics        │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                      DATA PIPELINE                         │
│         (Pandas / NumPy / Python Data Ingestion)           │
│    • Fetches FUELHH (Actuals) & WINDFOR (Forecasts)        │
│    • Caches immutable CSV snapshots for high availability  │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                     ELEXON BMRS API                        │
│          UK National Grid Wholesale Market Data            │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_4-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B573?style=flat-square&logo=react&logoColor=white)

### Backend & Data
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white)

### Deployment & Infrastructure
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

---

## 📁 Project Structure

```text
wind-forecast-monitor/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application & route definitions
│   │   ├── elexon.py        # Core domain logic & D-1 cutoff enforcement
│   │   └── analysis.py      # Statistical KPI and uncertainty band calculations
│   ├── data/                # Immutable CSV snapshots (Actuals & Forecasts)
│   ├── scripts/
│   │   └── fetch_data.py    # Elexon BMRS ingestion pipeline (or mock_data.py)
│   ├── Dockerfile           # Python 3.12 slim container definition
│   ├── requirements.txt     # Locked backend dependencies
│   └── vercel.json          # Serverless execution environment configuration
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main dashboard view & KPI components
│   │   └── index.css        # Tailwind directives
│   ├── Dockerfile           # Node 20 alpine container definition
│   ├── tailwind.config.js   
│   └── package.json         
├── docker-compose.yml       # Local development orchestration
└── README.md
```

---

## ⚙️ Setup & Installation (Local Docker)

### Prerequisites
- Docker & Docker Compose installed
- Python 3.12 (if generating data locally prior to build)

### 1. Clone the repository
```bash
git clone https://github.com/Piyushratn/wind-forecast-monitor.git
cd wind-forecast-monitor
```

### 2. Generate the Data Snapshots
To ensure the dashboard is immune to Elexon API downtimes, fetch the immutable CSV snapshots first:
```bash
cd backend
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python scripts/mock_data.py # or fetch_data.py
cd ..
```

### 3. Spin up the Containers
```bash
docker-compose up --build
```

### 4. Access the Application
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ☁️ Deployment (Vercel)

This monorepo is configured for zero-config deployments on Vercel.

1. **Frontend**: Import the repository into Vercel and set the **Root Directory** to `frontend`. Vercel automatically detects the Vite build profile.
2. **Backend**: Create a second Vercel project from the same repository, setting the **Root Directory** to `backend`. Vercel will parse `vercel.json` and deploy the FastAPI application as serverless functions.
   *(Note: Ensure the `axios.get()` URL in `frontend/src/App.tsx` points to your deployed backend URL).*

---

## 🧠 Domain Rules & Guardrails

To ensure financial and operational safety, the following domain rules are strictly enforced in the data layer:

1. **Strict Decision Cutoff (D-1 09:00 UTC):** The API strictly filters out any forecast published *after* this cutoff for a given delivery day to accurately reflect the data available to the trader at the moment of the decision.
2. **Zero Data Leakage:** The P10/P90 uncertainty bands for a target delivery day are calculated *exclusively* using forecast errors from days strictly prior to the target date. 
3. **Risk Definition:** Error is calculated as `Forecast - Actual`. A positive error indicates an over-forecast (shortfall risk), meaning additional thermal generation must be purchased to balance the grid.

---

## 🤖 AI Usage Disclaimer

In accordance with project requirements, AI tools (Claude 3.5 Sonnet / Gemini) were utilized during the development of this product to assist with scaffolding boilerplate configuration (Docker/Vite), generating synthetic mock data for testing, and optimizing the Pandas vectorized mathematical logic for KPI generation. All domain rules and architecture decisions were explicitly directed and verified by the developer.

---

## 👨‍💻 Author

**Piyush Ratn** — Full-Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/piyush-ratn)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Piyushratn)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).