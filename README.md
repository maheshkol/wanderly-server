# Wanderly — Backend API

REST API for the Wanderly travel web app. Built with Node.js, Express, and MongoDB Atlas. Features a live destination search that fetches real travel data from the web via Tavily API and caches it in MongoDB.

---

## Tech Stack

- **Node.js** + **Express** — server and routing
- **MongoDB Atlas** + **Mongoose** — database and ODM
- **Tavily API** — live web search for travel data
- **dotenv** — environment variable management
- **CORS** — cross-origin support for frontend

---

## Features

- Search any destination → fetches live data if not in DB, caches it for future searches
- Returns all previously searched destinations
- Search count tracking per destination
- Full CRUD for destinations
- Health check endpoint

---

## Project Structure

```
server/
├── models/
│   └── Destination.js       # Mongoose schema
├── routes/
│   └── destinationRoutes.js # All API routes
├── .env                     # Environment variables (not committed)
├── .gitignore
├── index.js                 # Entry point
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/destinations` | Get all cached destinations |
| GET | `/destinations/search?q=Goa` | Search — DB first, then live fetch |
| GET | `/destinations/:id` | Get single destination by ID |
| POST | `/add-destination` | Manually add a destination |
| DELETE | `/destinations/:id` | Delete a destination |
| GET | `/` | Health check |

---

## Getting Started Locally

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/wanderly-server.git
cd wanderly-server
```

**2. Install dependencies**
```bash
npm install
```

**3. Create a `.env` file**
```
MONGO_URI=your_mongodb_atlas_connection_string
TAVILY_API_KEY=your_tavily_api_key
PORT=5000
CLIENT_URL=http://localhost:3000
```

- Get MongoDB URI from [MongoDB Atlas](https://cloud.mongodb.com)
- Get Tavily API key from [tavily.com](https://tavily.com)

**4. Run the server**
```bash
node index.js
```

Server runs at `http://localhost:5000`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `TAVILY_API_KEY` | Tavily search API key |
| `PORT` | Port to run server on (default 5000) |
| `CLIENT_URL` | Frontend URL for CORS whitelist |

---

## Deployment (Render)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect this repo
4. Set build command: `npm install`
5. Set start command: `node index.js`
6. Add all environment variables in Render dashboard
7. Set MongoDB Atlas Network Access to allow `0.0.0.0/0`

---

## Live Demo

Backend: `https://wanderly-server.onrender.com`

---

## License

MIT
