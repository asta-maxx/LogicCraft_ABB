# LogicCraft AI Backend API

## Prerequisites
- Python 3.10+
- Redis
- OpenPLC Validator (on system PATH)

## Installation
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Create a `.env` file:
   ```bash
   DEBUG=False
   SECRET_KEY=your-secret-key-here
   REDIS_URL=redis://localhost:6379/0
   VLLM_SERVER_URL=http://localhost:8001/v1
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```
5. Run migrations: `python manage.py migrate`
6. Start the server: `python manage.py runserver`

## API Reference
- **POST** `/api/generate/`
- **POST** `/api/validate/`

## Connecting the Services
- Frontend: Set `NEXT_PUBLIC_API_BASE_URL` to this Django server (e.g., `http://localhost:8000/api`).
- AI Service: vLLM server must be running and accessible at `VLLM_SERVER_URL`.
- Redis: Redis server must be running.

## Testing
Run the test suite with: `python manage.py test`
