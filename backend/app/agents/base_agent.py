from abc import ABC, abstractmethod
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
from app.tools.search_tool import run_search


class BaseAgent(ABC):
    """
    All specialized agents inherit from this.
    Each agent has a role, a system prompt, a shared LLM,
    and the ability to search the web before answering.
    """

    role: str = "general"
    search_query_template: str | None = None

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
        pass

    def _build_search_query(self, query: str, project_context: str) -> str | None:
        if not self.search_query_template:
            return None
        industry = ""
        for line in project_context.split("\n"):
            if line.startswith("INDUSTRY:"):
                industry = line.replace("INDUSTRY:", "").strip()
                break
        return self.search_query_template.format(query=query, industry=industry)

    def execute(self, query: str, project_context: str, memory_context: str) -> str:
        # Web search
        web_context = "No web search performed."
        search_query = self._build_search_query(query, project_context)
        if search_query:
            try:
                web_context = run_search(search_query)
            except Exception as e:
                web_context = f"Web search unavailable: {str(e)}"

        # Prompt with all context layers
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("human", (
                "PROJECT CONTEXT:\n{project_context}\n\n"
                "RELEVANT PAST INTERACTIONS:\n{memory_context}\n\n"
                "LIVE WEB DATA:\n{web_context}\n\n"
                "ENTREPRENEUR'S QUESTION:\n{query}\n\n"
                "Use the web data to ground your advice in real market conditions. "
                "Cite specific data points from the web results when relevant."
            ))
        ])

        chain = prompt | self.llm
        response = chain.invoke({
            "project_context": project_context,
            "memory_context": memory_context,
            "web_context": web_context,
            "query": query
        })

        return response.content