# Online Survey Builder

A full-stack web application for creating surveys, collecting responses, and viewing analytics.

## Features

- **User Authentication** — Register, login, JWT-protected routes
- **Create Surveys** — Title, description, category, expiration date
- **Question Types** — Short answer, long answer, multiple choice, checkboxes, dropdown, rating (1–5), Yes/No
- **Share Links** — Unique public URL for each published survey
- **Response Collection** — Required-field validation, anonymous responses
- **Analytics Dashboard** — Charts (Pie/Bar) + total responses
- **Export** — Download responses as CSV
- **Search & Filter** — By title and status
- **Responsive UI**

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, React Router, Chart.js |
| Backend   | Node.js, Express                    |
| Database  | MongoDB (Mongoose)                 |
| Auth      | JWT + bcrypt                        |

## Project Structure

```
survey-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend

```bash
cd server
npm install
# Edit .env if needed (MONGODB_URI, JWT_SECRET, PORT)
npm run dev
```

Server runs on http://localhost:5000

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs on http://localhost:3000 (proxies `/api` to backend)

### Environment Variables (server/.env)

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/survey-builder
JWT_SECRET=your_secret_here
NODE_ENV=development
```

For production, use MongoDB Atlas and a strong JWT_SECRET.

## API Overview

| Method | Endpoint                         | Description                |
|--------|----------------------------------|----------------------------|
| POST   | /api/auth/register               | Register                   |
| POST   | /api/auth/login                  | Login                      |
| GET    | /api/auth/me                     | Current user               |
| POST   | /api/surveys                     | Create survey              |
| GET    | /api/surveys                     | List my surveys            |
| GET    | /api/surveys/:id                 | Get survey                 |
| PUT    | /api/surveys/:id                 | Update survey              |
| DELETE | /api/surveys/:id                 | Delete survey              |
| GET    | /api/surveys/public/:shareId     | Public survey (take)       |
| GET    | /api/surveys/:id/analytics       | Analytics                  |
| POST   | /api/responses                   | Submit response            |
| GET    | /api/responses/survey/:id        | List responses             |
| GET    | /api/responses/survey/:id/export | Export CSV                 |

## Usage Flow

1. Register / Login  
2. Create a survey and add questions  
3. Publish the survey  
4. Copy the share link (`/s/:shareId`) and send it  
5. Respondents fill and submit  
6. View analytics and export CSV from the dashboard  

## Deployment Notes

- **Frontend**: Vercel / Netlify  
- **Backend**: Render / Railway  
- **Database**: MongoDB Atlas  

Set `VITE_API_URL` (or update axios baseURL) for production API URL.

## License

MIT
