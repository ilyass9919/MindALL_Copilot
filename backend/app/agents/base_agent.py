from abc import ABC, abstractmethod
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings


class BaseAgent(ABC):
    """
    All specialized agents inherit from this.
    Each agent has a role, a system prompt, and a shared LLM.
    """

    role: str = "general"

    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model="gpt-4o-mini",
            temperature=0.7
        )

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """Each agent defines its own expert persona."""
        pass

    def execute(self, query: str, project_context: str, memory_context: str) -> str:
        """Run the agent with full context and return its response."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("human", (
                "PROJECT CONTEXT:\n{project_context}\n\n"
                "RELEVANT PAST INTERACTIONS:\n{memory_context}\n\n"
                "ENTREPRENEUR'S QUESTION:\n{query}"
            ))
        ])

        chain = prompt | self.llm
        response = chain.invoke({
            "project_context": project_context,
            "memory_context": memory_context,
            "query": query
        })

        return response.content