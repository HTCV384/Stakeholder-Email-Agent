"""
Base Agent Class
"""
from abc import ABC, abstractmethod
from utils.llm_api import LLMClient

class Agent(ABC):
    """
    Abstract base class for all agents in the system.
    """
    def __init__(self, name, model="google/gemini-2.5-flash"):
        self.name = name
        self.llm_client = LLMClient(model=model)

    @abstractmethod
    async def run(self, *args, **kwargs):
        """
        Execute the agent's main logic.
        Must be implemented by subclasses.
        """
        pass
