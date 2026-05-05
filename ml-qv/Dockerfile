FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    ML_MODEL_DIR=/app/model_artifacts

WORKDIR /app

# OS deps for numpy / scipy / xgboost compiled wheels.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

# Source modules — flat layout (no app/ package).
COPY __init__.py main.py schemas.py setup.py pyproject.toml ./
COPY models/    ./models/
COPY training/  ./training/
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh

# Artifact directory — populated at startup or by the mounted host volume.
# Training runs at container startup (entrypoint.sh) if artifacts are absent,
# using eBay credentials injected from the environment (Doppler / .env).
RUN mkdir -p "$ML_MODEL_DIR"

EXPOSE 8001
ENTRYPOINT ["./entrypoint.sh"]
