# FarmTrack

A platform to monitor livestock antimicrobial usage (AMU) and prevent antibiotic runoff into water bodies.

## Tech Stack

- **Frontend**: React.js (Create React App)
- **Backend**: Node.js + Express.js
- **Database**: MySQL (local for now, Supabase later)
- **Charts**: Recharts
- **Maps**: Leaflet.js
- **Weather API**: OpenWeatherMap
- **AI Chatbot**: Gemini API
- **Hosting**: Vercel (frontend) + Render (backend)
- **Version Control**: Git + GitHub

## Project Structure

```
farmtrack/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── App.jsx
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── db/
│   └── server.js
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MySQL credentials

5. Create the database and seed data:
   ```bash
   node db/seed.js
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

Server runs at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Start the React app:
   ```bash
   npm start
   ```

App runs at `http://localhost:3000`

## Access Dashboards

- Vet Dashboard: `http://localhost:3000/vet`
- Farmer Dashboard: `http://localhost:3000/farmer`
- Authority Dashboard: `http://localhost:3000/authority`

No login required — dashboards are directly accessible via URL.

## Environment Variables

### Backend (.env)
- `DB_HOST`: MySQL host (default: localhost)
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (farmtrack)
- `PORT`: Server port (default: 5000)
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key (optional, uses mock data if not set)

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (http://localhost:5000)
- `REACT_APP_GEMINI_API_KEY`: Gemini API key (optional, shows placeholder if not set)

## Team

RVU Crew

## License

MIT
