import requests

class LLMClient:
    def __init__(self, server_url):
        self.server_url = server_url

    def generate_code(self, user_input):
        prompt = f"You are an expert PLC programmer. Generate only valid IEC 61131-3 Structured Text for the following request. Output nothing but the code: {user_input}"
        payload = {
                "prompt": f"You are an expert PLC programmer. Generate only valid IEC 61131-3 Structured Text for the following request. Output nothing but the code: {prompt}",
                "max_tokens": 256
            }
        try:
                response = requests.post(f"{self.server_url}/completions", json=payload, timeout=10)
                response.raise_for_status()
                data = response.json()
                return data.get("choices", [{}])[0].get("text", "")
        except Exception as e:
                return f"Error: {str(e)}"
