FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    ML_MODEL_DIR=/app/model_artifacts

WORKDIR /app

# Install OS deps for numpy / scipy / xgboost compiled wheels.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

# Flat layout (no app/ package): source modules sit directly under /app.
COPY __init__.py main.py schemas.py setup.py pyproject.toml ./
COPY models/   ./models/
COPY training/ ./training/

# Train baseline models at build time so the image ships ready-to-serve.
# In real deployments you'd download trained artifacts from object storage instead.
RUN mkdir -p "$ML_MODEL_DIR" \
    && python -m training.train_valuation \
    && python -m training.train_depreciation

EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
