# Dropshipping Research Tool

Eine vollautomatische Web-App zur Produkt- und Marktrecherche für Dropshipping.

## Features

- **Google Trends** — Trendkurven, Top- & aufsteigende Suchanfragen, Trending-Suchen
- **Produkt-Recherche** — AliExpress & Amazon parallel durchsuchen, Preise vergleichen
- **TikTok Trends** — Hashtag-Analyse, virale Videos, Trending Creative Center

## Tech Stack

| Schicht | Technologie |
|---------|-------------|
| Backend | Python 3.12, FastAPI, pytrends, httpx, BeautifulSoup4 |
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Deployment | Docker, Docker Compose |

## Schnellstart

### Mit Docker (empfohlen)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Lokal (Entwicklung)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

```
GET /api/trends/search?keyword=...&timeframe=...&geo=DE
GET /api/trends/trending?geo=germany

GET /api/products/aliexpress?keyword=...&sort_by=orders
GET /api/products/amazon?keyword=...
GET /api/products/amazon/bestsellers

GET /api/tiktok/search?keyword=...
GET /api/tiktok/trending
```

## Workflow

1. **TikTok Trends** → Virale Produkte entdecken
2. **Google Trends** → Trendkurve prüfen (steigend?)
3. **AliExpress** → Lieferantenpreis finden
4. **Amazon** → Verkaufspreis & Marge kalkulieren
