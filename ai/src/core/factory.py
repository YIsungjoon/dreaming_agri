from typing import Dict, Type, Optional
from langchain_core.language_models.chat_models import BaseChatModel
from .base import BaseLLMProvider
from .providers.nvidia_provider import NvidiaLLMProvider
from .providers.mock_provider import MockLLMProvider
from ..config import config

class LLMFactory:
    """
    Registry & Factory pattern for managing multiple LLM providers (SoC Architecture).
    Allows adding new providers seamlessly (NVIDIA, OpenAI, Anthropic, Ollama, etc.).
    """
    
    _providers: Dict[str, Type[BaseLLMProvider]] = {
        "nvidia": NvidiaLLMProvider,
        "mock": MockLLMProvider,
    }

    @classmethod
    def register_provider(cls, name: str, provider_cls: Type[BaseLLMProvider]):
        """Register a new LLM provider class"""
        cls._providers[name.lower()] = provider_cls

    @classmethod
    def create(
        cls,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> BaseLLMProvider:
        """Instantiates and returns a BaseLLMProvider instance"""
        provider_name = (provider or config.default_provider).lower()
        model_name = model or config.default_model

        provider_cls = cls._providers.get(provider_name)
        if not provider_cls:
            raise ValueError(
                f"Unknown LLM Provider '{provider_name}'. Available providers: {list(cls._providers.keys())}"
            )

        return provider_cls(model=model_name, **kwargs)

    @classmethod
    def get_chat_model(
        cls,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> BaseChatModel:
        """Convenience method to directly retrieve a LangChain BaseChatModel"""
        llm_provider = cls.create(provider=provider, model=model, **kwargs)
        return llm_provider.get_chat_model(**kwargs)

def get_llm(
    provider: Optional[str] = None,
    model: Optional[str] = None,
    **kwargs
) -> BaseChatModel:
    """Utility function to retrieve an initialized LangChain ChatModel"""
    return LLMFactory.get_chat_model(provider=provider, model=model, **kwargs)
