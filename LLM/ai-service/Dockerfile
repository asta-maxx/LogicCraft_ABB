# Use the official NVIDIA CUDA base image for compatibility
FROM nvidia/cuda:12.1.0-base-ubuntu22.04

WORKDIR /app

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install vLLM with CUDA 12.1 support and a basic API server
RUN pip3 install vllm==0.2.5 fastapi uvicorn

# Copy the launch script into the container
COPY serve_model.py .

# The model files are mounted from the host via docker-compose.yml
# Expose the port the server will run on
EXPOSE 8001

# Command to start the vLLM server
CMD ["python3", "serve_model.py"]
