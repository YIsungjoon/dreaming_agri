import os
from dataclasses import dataclass

@dataclass
class LLMConfig:
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", "")
    default_provider: str = os.getenv("DEFAULT_LLM_PROVIDER", "nvidia")
    default_model: str = os.getenv("DEFAULT_LLM_MODEL", "z-ai/glm-5.2")
    temperature: float = float(os.getenv("DEFAULT_TEMPERATURE", "1.0"))
    top_p: float = float(os.getenv("DEFAULT_TOP_P", "1.0"))
    max_tokens: int = int(os.getenv("DEFAULT_MAX_TOKENS", "16384"))
    seed: int = int(os.getenv("DEFAULT_SEED", "42"))

config = LLMConfig()
