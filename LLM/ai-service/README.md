# LogicCraft AI Service: vLLM Inference Server

This service provides a high-performance, OpenAI-compatible API for LLM inference using vLLM and NVIDIA GPUs. It is designed to serve quantized CodeLlama models for production use in the LogicCraft AI system.

## Features
- **vLLM Engine**: Fast, memory-efficient inference with PagedAttention and continuous batching.
- **Model Support**: Fine-tuned and quantized CodeLlama models (AWQ 4-bit) or Hugging Face models for testing.
- **API**: OpenAI-compatible endpoint at `/v1/completions`.
- **Dockerized**: Runs as a container with GPU access via Docker Compose.

## Quick Start

1. **Build and Start the Service**
   ```bash
   docker compose up -d ai-service
   ```

2. **Test the API**
   - List models:
     ```bash
     curl http://localhost:8001/v1/models
     ```
   - Generate completion:
     ```bash
     curl http://localhost:8001/v1/completions \
       -H "Content-Type: application/json" \
       -d '{
         "model": "codellama-plc-specialist",
         "prompt": "Write ST code for: Start pump on low level",
         "max_tokens": 100,
         "temperature": 0.1
       }'
     ```

## Configuration
- **Model Path**: Set `MODEL_PATH` in `docker-compose.yml` to either a local model directory or a Hugging Face repo name.
- **GPU Access**: Requires NVIDIA GPU (≥24GB VRAM) and NVIDIA Container Toolkit.

## File Structure
```
ai-service/
├── Dockerfile
├── serve_model.py
├── README.md
```

## Troubleshooting
- Ensure your GPU drivers and NVIDIA Container Toolkit are installed.
- Check logs with:
  ```bash
  docker compose logs ai-service
  ```
- For local testing, install vLLM in a Python environment with CUDA support.

## License
Proprietary. All rights reserved.
