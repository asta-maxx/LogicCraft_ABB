import subprocess
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="../model", help="Path to Tiny-LLM model directory")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host for API server")
    parser.add_argument("--port", type=int, default=8001, help="Port for API server")
    parser.add_argument("--name", type=str, default="tiny-llm", help="Served model name")
    args = parser.parse_args()

    cmd = [
        "vllm", "serve", args.model,
        "--host", args.host,
        "--port", str(args.port),
        "--served-model-name", args.name,
        "--max-model-len", "1024",   # Tiny-LLM is small → reduce context
        "--gpu-memory-utilization", "0.8",
        "--enforce-eager",
        "--disable-log-requests",
    ]

    subprocess.run(cmd, check=True)
