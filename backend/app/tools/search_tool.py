from langchain_community.tools.tavily_search import TavilySearchResults
from app.core.config import settings
import os


def get_search_tool(max_results: int = 3) -> TavilySearchResults:
    """
    Returns a configured Tavily search tool.
    Tavily is purpose-built for AI agents — it returns clean,
    structured results without HTML noise.
    """
    os.environ["TAVILY_API_KEY"] = settings.TAVILY_API_KEY

    return TavilySearchResults(
        max_results=max_results,
        search_depth="advanced",       # deeper search for business queries
        include_answer=True,           # returns a direct answer + sources
        include_raw_content=False,     # keep responses clean
    )


def run_search(query: str, max_results: int = 3) -> str:
    """
    Run a web search and return formatted results as a string
    ready to be injected into an agent's context.
    """
    tool = get_search_tool(max_results)
    results = tool.invoke(query)

    if not results:
        return "No web search results found."

    formatted = []
    for i, r in enumerate(results, 1):
        formatted.append(
            f"[Source {i}] {r.get('url', '')}\n"
            f"{r.get('content', '')}"
        )

    return "\n\n".join(formatted)