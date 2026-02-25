from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
from app.agents.marketing_agent import MarketingAgent
from app.agents.finance_agent import FinanceAgent
from app.agents.strategy_agent import StrategyAgent
from app.memory.chroma_store import memory_store
import json


# Map agent type strings to agent classes
AGENT_REGISTRY = {
    "marketing": MarketingAgent,
    "finance": FinanceAgent,
    "strategy": StrategyAgent,
}


class AgentOrchestrator:
    """
    The Orchestrator:
    1. Classifies the user's query into a domain (marketing/finance/strategy)
    2. Retrieves relevant memory from Pinecone
    3. Delegates to the right specialized agent
    4. Saves the interaction to memory
    5. Returns the response
    """

    def __init__(self):
        # Lightweight LLM just for classification (fast & cheap)
        self.classifier_llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model="gpt-4o-mini",
            temperature=0  # Deterministic for classification
        )

    def _classify_query(self, query: str) -> str:
        """Determine which agent should handle this query."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a query router for an AI entrepreneur assistant.
Classify the user's question into exactly ONE of these categories:
- marketing: branding, content, social media, visibility, storytelling, audience, campaigns
- finance: pricing, revenue, costs, funding, monetization, financial model, profit
- strategy: business model, roadmap, vision, competition, product-market fit, growth, pivoting

Respond with ONLY the category name in lowercase. No explanation."""),
            ("human", "{query}")
        ])

        chain = prompt | self.classifier_llm
        result = chain.invoke({"query": query})
        agent_type = result.content.strip().lower()

        # Fallback to strategy if classification is unexpected
        return agent_type if agent_type in AGENT_REGISTRY else "strategy"

    def _build_project_context(self, project) -> str:
        """Format the project DB object into a readable context string."""
        return (
            f"Project Title: {project.title}\n"
            f"Industry: {project.industry}\n"
            f"Description: {project.description}\n"
            f"Vision: {project.vision or 'Not defined yet'}\n"
            f"Previous AI Analysis: {project.ai_analysis or 'None yet'}"
        )

    def process(self, query: str, project) -> dict:
        """
        Main entry point. Takes a query + project object, returns a full response dict.
        """
        project_id = project.id

        # Step 1: Classify the query
        agent_type = self._classify_query(query)

        # Step 2: Retrieve relevant past interactions from Pinecone
        memory_context = memory_store.retrieve_context(
            project_id=project_id,
            query=query
        )

        # Step 3: Build project context
        project_context = self._build_project_context(project)

        # Step 4: Instantiate the right agent and get its response
        AgentClass = AGENT_REGISTRY[agent_type]
        agent = AgentClass()
        response = agent.execute(
            query=query,
            project_context=project_context,
            memory_context=memory_context
        )

        # Step 5: Save this interaction to Pinecone for future context
        memory_store.save_interaction(
            project_id=project_id,
            query=query,
            response=response,
            agent_type=agent_type
        )

        return {
            "agent_used": agent_type,
            "response": response
        }


# Singleton instance
orchestrator = AgentOrchestrator()