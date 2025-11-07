# LeadNurture AI CRM

**LeadNurture** is an AI-powered CRM platform designed for real estate teams to automate lead nurturing, follow-ups, and personalized messaging. It combines Django Ninja for the backend API, React for the frontend, OpenAI for AI-generated responses, and ChromaDB for vector-based project/brochure retrieval.

<img width="1837" height="1011" alt="Create Campaign" src="https://github.com/user-attachments/assets/972c11db-ee78-4b4b-b9d7-18f7b0aea8c2" />

https://github.com/user-attachments/assets/5d0acf19-0391-4492-adac-561d776c07d1

---

## Features

- **Campaign Management**: Create and manage marketing campaigns with specific project offers.
- **Lead Shortlisting**: Track leads associated with each campaign.
- **AI Agent Follow-Up**: Automatically generate personalized messages for leads using OpenAI.
- **Conversation Summaries**: AI-generated summaries for each lead conversation.
- **Frontend Dashboard**: React-based UI for campaign analytics and follow-ups.
- **ChromaDB Integration**: Retrieve brochure/project information for hyper-personalized messaging.

---

## Tech Stack

- **Backend**: Django Ninja, Python 3.12, SQLite (default)
- **Frontend**: React, Material UI
- **AI**: OpenAI GPT-4o-mini
- **Vector Database**: ChromaDB
- **Deployment**: Render

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn
- OpenAI API Key

### Backend Setup

1. Navigate to the backend folder:

   ```bash
   cd leadnurture
   ```
2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate     # Windows
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up environment variables in `.env`:
   ```bash
   SECRET_KEY=<your-django-secret-key>
   OPENAI_API_KEY=<your-openai-api-key>
   FROM_EMAIL=<your-email-id>
   ```
5. Start backend (replace the `$PORT` with 8000):
   ```bash
   ./start.sh
   ```
### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
Frontend will run on http://localhost:3000 and backend on http://localhost:8000.
   
   
