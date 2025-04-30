# Transparency.ai

![alt text](images/ui-new.png)

**Get actionable feedback on every job application**

Have you ever applied to a job and received a rejection with no explanation? Left wondering what in your profile was lacking, and playing Russian roulette with applications? With Transparency.ai, you get detailed feedback—whether it’s a rejection, acceptance, or a “maybe.” Our ATS (Applicant Tracking System) parser analyzes your resume/profile against any job description and suggests targeted improvements to boost your chances.

---

## 🚀 Features

- **Automated Feedback**: Parse your resume against job descriptions and receive clear, actionable insights.
- **Rejection & Acceptance Analysis**: Understand why applications fail or pass.
- **Smart Suggestions**: Tailored resume and profile edits to match job requirements.
- **API & UI**: RESTful Flask backend with React-based frontend for a seamless user experience.

---

## 🏗️ Tech Stack

- **Backend**: Flask, Python 3.10
- **Frontend**: React, Node.js
- **Data Parsing**: Custom ATS parser (open-source libraries)
- **AI Engine**: Integrations with Ollama or OpenAI for NLP feedback
- **Containerization**: Docker & Docker Compose

---

## 📦 Getting Started

### Prerequisites

- Docker & Docker Compose
- (Optional) Python 3.10 environment
- (Optional) Node.js & npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gauthamys/transparency.ai.git
   cd transparency.ai
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Set your variables:
     ```text
     FLASK_ENV=development
     OLLAMA_URL=http://host.docker.internal:11434
     REACT_APP_API_URL=http://localhost:5000
     ```

3. **Bring up services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
