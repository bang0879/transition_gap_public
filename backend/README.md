# Transition Gap API (Backend)

FastAPI stateless calculation engine for Transition Gap diagnosis.

## Local Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

## Tests

```bash
cd backend
pytest tests/ -v
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/diagnose` | Returns area analysis, visibility index, matrix coordinates, and cross-domain insights |
| GET | `/api/schema` | Returns diagnosis variable schema |
| GET | `/api/scenarios` | Returns scenario content |
| GET | `/api/options` | Returns HR option and benchmark content |
| POST | `/api/events` | Logs user behavior events to local SQLite |
| GET | `/health` | Server health check |

## Structure

- `app/core/`: pure Python calculation logic
- `app/api/`: FastAPI routes
- `app/schemas/`: Pydantic request/response schemas
- `app/content/`: static JSON content
