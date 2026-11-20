# Vedic AI Engine

A backend AI service built with **Node.js, TypeScript, Express, MongoDB Atlas Vector Search, and the Vercel AI SDK**.

It combines two capabilities inside a single chat endpoint:
1. **Scripture RAG (Retrieval-Augmented Generation):** Searches the Rigveda and Bhagavad Gita using vector embeddings so the AI answers with real Sanskrit verses and meanings instead of guessing.
2. **Ritual & Pandit Booking Agent:** Uses AI tool calling to check Pooja/Havan pricing, verify Pandit availability by city and date, and create, reschedule, or cancel bookings in MongoDB.

---

## How It Works (System Architecture)

```text
User / Postman
      │
      ▼  POST /api/agent/chat  { "messages": [...] }
┌────────────────────────────────────────────────────────┐
│              Express + TypeScript Server               │
│                                                        │
│   AgentService (Vercel AI SDK + Groq qwen/qwen3.8-27b) │
│          │                                  │          │
│          ▼ (Needs Scripture?)               ▼ (Needs DB Action?)
│   VedaService                        BookingService    │
│   • Turns question into 768-dim      • Check rituals   │
│     vector via Gemini                • Check Pandits   │
│   • Runs $vectorSearch in Atlas      • Book / Cancel   │
└──────────┼──────────────────────────────────┼──────────┘
           │                                  │
           ▼                                  ▼
┌────────────────────────────────────────────────────────┐
│               MongoDB Atlas (Single DB)                │
│  • vedicverses  ──▶ Vector Search Index (768-dim)      │
│  • rituals, pandits, bookings ──▶ Standard Collections │
└────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow
1. **Startup Seeding (`seed.service.ts` & `veda.service.ts`):** When the server starts, if the database is empty, it seeds initial rituals, Pandits, and scripture verses (converting each verse into a 768-number embedding using `gemini-embedding-001`).
2. **User Sends a Message (`POST /api/agent/chat`):** The message goes to `AgentService`, which sends the conversation and available tools to Groq (`qwen/qwen3.8-27b`).
3. **AI Chooses the Right Tool (`ritual.tools.ts`):**
   - If the user asks about scriptures $\rightarrow$ calls `searchVedicScriptures` (runs cosine vector search on `vedicverses`).
   - If the user asks about rituals, availability, or booking $\rightarrow$ calls `getRitualCatalog`, `checkPanditAvailability`, `createRitualBooking`, `rescheduleRitualBooking`, or `cancelRitualBooking`.
4. **Final Grounded Reply:** The AI reads the real database results and writes a clear, accurate response.

---

## Folder Structure

```text
vedic-ai-engine/
├── data/                        # Local Rigveda & Gita JSON files (ignored in Git)
├── src/
│   ├── controller/              # Request/response handlers for agent & admin routes
│   ├── db/                      # MongoDB Atlas connection
│   ├── models/                  # Mongoose schemas (Ritual, Pandit, Booking, VedicVerse)
│   ├── routes/                  # Express API routes
│   ├── services/                # Core business logic (Agent, Booking, Seed, Veda RAG)
│   ├── tools/                   # Zod-validated tools given to the AI model
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Entry point (connects DB, seeds data, starts server)
├── .env                         # API keys & DB URI (ignored in Git)
├── package.json
└── tsconfig.json
```

---

## Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd vedic-ai-engine
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root folder and add:

```env
MONGO_URI=your_mongodb_atlas_connection_string

# Chat & Tool Calling (Groq Free Tier)
LLM_BASE_URL=[https://api.groq.com/openai/v1](https://api.groq.com/openai/v1)
LLM_API_KEY=your_groq_api_key
LLM_MODEL=qwen/qwen3.8-27b

# Vector Embeddings (Google AI Studio Free Tier)
EMBED_BASE_URL=[https://generativelanguage.googleapis.com/v1beta/openai](https://generativelanguage.googleapis.com/v1beta/openai)
EMBED_API_KEY=your_google_ai_studio_api_key
EMBED_MODEL=gemini-embedding-001
```

### 3. Run Server & Create Vector Search Index
1. Start the server once so it seeds `rituals`, `pandits`, and `vedicverses`:
   ```bash
   npm run dev
   ```
2. Open **MongoDB Atlas** $\rightarrow$ **Search & Vector Search** $\rightarrow$ **Create Search Index** $\rightarrow$ **Atlas Vector Search (JSON Editor)**.
3. Select database `vedic-ai-engine` and collection `vedicverses`, set the Index Name to **`vedic_vector_index`**, and paste:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 768,
         "similarity": "cosine"
       }
     ]
   }
   ```
4. Wait ~30 seconds until the index status turns **Active**.

---

## API Endpoints

### 1. Chat with the Vedic AI Agent
**`POST /api/agent/chat`**

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Share a Rigveda verse on Agni, and check if any Pandit is available in Gurugram for Griha Pravesh Havan on 2026-11-22 in the morning along with the Dakshina."
    }
  ]
}
```

### 2. Reset Demo Data
**`POST /api/admin/reset-demo`**

Clears test bookings and restores the default rituals and Pandit availability slots.