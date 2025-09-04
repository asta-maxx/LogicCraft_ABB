from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch

class LLMClient:
    def __init__(self, model_name: str = "codellama/CodeLlama-7b-hf"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)
        self.device = 0 if torch.cuda.is_available() else -1
        self.generator = pipeline("text-generation", model=self.model, tokenizer=self.tokenizer, device=self.device)

    def generate_code(self, user_input):
        prompt = f"You are an expert PLC programmer. Generate only valid IEC 61131-3 Structured Text for the following request. Output nothing but the code: {user_input}"
        output = self.generator(prompt, max_new_tokens=256, do_sample=True)
        return output[0]["generated_text"]
