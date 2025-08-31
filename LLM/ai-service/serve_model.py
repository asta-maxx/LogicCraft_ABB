from fastapi import FastAPI, Request
from transformers import pipeline
import os
import uvicorn
from vllm.entrypoints.api_server import serve_model_from_args
from vllm.entrypoints.openai.api_server import run_server
import argparse

app = FastAPI()

MODEL_NAME = os.getenv("MODEL_PATH", "codellama/CodeLlama-7b-hf")
pipe = pipeline("text-generation", model=MODEL_NAME)

@app.post("/v1/completions")
async def completions(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "")
    max_tokens = body.get("max_tokens", 100)
    temperature = body.get("temperature", 0.1)
    result = pipe(prompt, max_new_tokens=max_tokens, temperature=temperature)
    return {
        "choices": [
            {"text": result[0]["generated_text"]}
        ]
    }

@app.get("/v1/models")
async def models():
    return {
        "object": "list",
        "data": [
            {
                "id": MODEL_NAME.split("/")[-1],
                "object": "model",
                "created": 0,
                "owned_by": "transformers"
            }
        ]
    }

# This script is a simple wrapper to run the vLLM server
# with our desired command-line arguments.
if __name__ == "__main__":
    # Parse command-line arguments or use environment variables
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default=None)
    parser.add_argument("--host", type=str, default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8001)
    args, unknown = parser.parse_known_args()
    
    # Override defaults with environment variables
    import os
    model_path = os.getenv('MODEL_PATH', args.model)
    host = os.getenv('HOST', args.host)
    port = int(os.getenv('PORT', args.port))
    
    # Define the command-line arguments for the vLLM engine
    vllm_args = [
        "--model", model_path,
        "--host", host,
        "--port", str(port),
        "--api-key", "null", # Disable API key for internal Docker network use
        "--served-model-name", "codellama-plc-specialist",
        "--tensor-parallel-size", "1",
        "--gpu-memory-utilization", "0.9",
        "--max-model-len", "2048",
        "--quantization", "awq", # Specify AWQ quantization
        "--enforce-eager", # Better for debugging
        "--disable-log-requests", # Reduce log spam
    ]
    
    # Start the server
    serve_model_from_args(vllm_args)
