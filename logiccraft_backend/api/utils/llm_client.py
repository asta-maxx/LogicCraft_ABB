# api/utils/llm_client.py
import requests
from urllib.parse import urljoin

class LLMClient:
    def __init__(self, base_url: str = "http://localhost:8001"):
        # Accept either "http://host:port" or "http://host:port/v1"
        self.base_url = base_url.rstrip("/")

    def _completions_url(self):
        # try to be resilient if user provided /v1 already
        if self.base_url.endswith("/v1"):
            return self.base_url + "/completions"
        return urljoin(self.base_url + "/", "v1/completions")

    def generate_code(self, prompt: str, max_tokens: int = 200, temperature: float = 0.1, timeout: int = 30):
        url = self._completions_url()
        payload = {"prompt": prompt, "max_tokens": max_tokens, "temperature": temperature}
        try:
            resp = requests.post(url, json=payload, timeout=timeout)
        except requests.RequestException as e:
            raise RuntimeError(f"LLM request failed: {e}")

        if resp.status_code != 200:
            raise RuntimeError(f"LLM returned {resp.status_code}: {resp.text}")

        try:
            data = resp.json()
        except ValueError:
            raise RuntimeError("LLM returned non-JSON response")

        # Support common formats: OpenAI-style "choices" or vLLM "choices"
        # Expecting something like: {"choices":[{"text": "..."}]}
        if isinstance(data, dict):
            # try choices -> text
            choices = data.get("choices") or data.get("data")
            if choices and isinstance(choices, list):
                first = choices[0]
                # try a few shapes
                if isinstance(first, dict) and "text" in first:
                    return first["text"]
                # vLLM sometimes wraps content differently
                if isinstance(first, dict) and "message" in first:
                    # chat style
                    msg = first["message"]
                    if isinstance(msg, dict) and "content" in msg:
                        return msg["content"]
                    if isinstance(msg, str):
                        return msg
                # fallback: stringify
                return str(first)
            # fallback when server returns "generated_text" (huggingface pipeline style)
            if "generated_text" in data:
                return data["generated_text"]
        raise RuntimeError("Unable to parse LLM response")
