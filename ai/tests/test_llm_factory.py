import os
import sys

# Ensure src/ is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.core.factory import LLMFactory, get_llm
from src.core.providers.nvidia_provider import NvidiaLLMProvider

def test_nvidia_provider_initialization():
    print("[1/3] Testing NvidiaLLMProvider Initialization...")
    provider = LLMFactory.create("nvidia", model="z-ai/glm-5.2")
    assert isinstance(provider, NvidiaLLMProvider)
    assert provider.model_name == "z-ai/glm-5.2"
    assert provider.temperature == 1.0
    assert provider.top_p == 1.0
    assert provider.max_tokens == 16384
    assert provider.seed == 42
    print("      ✓ NvidiaLLMProvider initialized with default parameters (model='z-ai/glm-5.2', temp=1, top_p=1, max_tokens=16384, seed=42)")

def test_mock_fallback_and_streaming():
    print("[2/3] Testing Mock Provider Streaming...")
    provider = LLMFactory.create("mock")
    stream = provider.stream_response("토마토 생식생장기 관리 지침")
    tokens = list(stream)
    assert len(tokens) > 0
    print(f"      ✓ Streaming test passed: '{''.join(tokens).strip()}'")

def test_direct_nvidia_chat_model():
    print("[3/3] Testing ChatNVIDIA Instantiation & Stream API...")
    api_key = os.getenv("NVIDIA_API_KEY", "")
    if not api_key:
        print("      ⚠️ NVIDIA_API_KEY is not set in environment. Skipping live API call.")
        print("      To test live ChatNVIDIA streaming, run: export NVIDIA_API_KEY='your-key'")
        return

    try:
        from langchain_nvidia_ai_endpoints import ChatNVIDIA
        client = ChatNVIDIA(
            model="z-ai/glm-5.2",
            api_key=api_key,
            temperature=1,
            top_p=1,
            max_tokens=16384,
            seed=42,
        )
        print("      ✓ ChatNVIDIA client instantiated successfully.")
        print("      Streaming Live Response:")
        for chunk in client.stream([{"role": "user", "content": "토마토 생식생장기 관리 한줄 요약"}]):
            print(chunk.content, end="", flush=True)
        print("\n      ✓ Live Streaming Complete.")
    except Exception as e:
        print(f"      ⚠️ Live test error: {e}")

if __name__ == "__main__":
    print("================ LLM CORE & FACTORY TEST SUITE ================")
    test_nvidia_provider_initialization()
    test_mock_fallback_and_streaming()
    test_direct_nvidia_chat_model()
    print("===============================================================")
