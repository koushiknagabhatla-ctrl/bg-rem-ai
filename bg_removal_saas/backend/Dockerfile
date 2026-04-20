FROM python:3.11-slim
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files — BOTH needed
COPY model_fp32.onnx /app/model/model_fp32.onnx
COPY 428d3184-3bfb-11f1-a4ea-0242ac130202.data /app/model/428d3184-3bfb-11f1-a4ea-0242ac130202.data

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
