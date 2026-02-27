from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
from app.agents.marketing_agent import MarketingAgent
from app.agents.finance_agent import FinanceAgent
from app.agents.strategy_agent import StrategyAgent
from app.memory.chroma_store import memory_store


AGENT_REGISTRY = {
    "marketing": MarketingAgent,
    "finance": FinanceAgent,
    "strategy": StrategyAgent,
}


class AgentOrchestrator:

    def __init__(self):
        self.classifier_llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model="gpt-4o-mini",
            temperature=0
        )

    def _classify_query(self, query: str) -> str:
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
        return agent_type if agent_type in AGENT_REGISTRY else "strategy"

    def _build_project_context(self, project) -> str:
        lines = [
            f"PROJECT TITLE: {project.title}",
            f"INDUSTRY: {project.industry}",
            f"DESCRIPTION: {project.description}",
        ]
        if project.vision:
            lines.append(f"VISION: {project.vision}")
        if project.target_market:
            lines.append(f"TARGET MARKET: {project.target_market}")
        if project.value_proposition:
            lines.append(f"VALUE PROPOSITION: {project.value_proposition}")
        if project.business_model:
            lines.append(f"BUSINESS MODEL: {project.business_model}")
        if project.main_challenges:
            lines.append(f"MAIN CHALLENGES: {project.main_challenges}")
        if project.priorities:
            lines.append(f"CURRENT PRIORITIES: {', '.join(project.priorities)}")
        if project.ai_analysis:
            lines.append(f"PREVIOUS ANALYSIS: {project.ai_analysis}")

        missing = []
        if not project.vision:         missing.append("vision")
        if not project.target_market:  missing.append("target market")
        if not project.business_model: missing.append("business model")
        if missing:
            lines.append(f"NOTE: The entrepreneur hasn't defined their {', '.join(missing)} yet. "
                         f"If relevant, gently ask for this information in your response.")
        return "\n".join(lines)

    def process(self, query: str, project) -> dict:
        project_id = project.id
        agent_type = self._classify_query(query)
        memory_context = memory_store.retrieve_context(project_id=project_id, query=query)
        project_context = self._build_project_context(project)
        AgentClass = AGENT_REGISTRY[agent_type]
        agent = AgentClass()
        response = agent.execute(
            query=query,
            project_context=project_context,
            memory_context=memory_context
        )
        memory_store.save_interaction(
            project_id=project_id,
            query=query,
            response=response,
            agent_type=agent_type
        )
        return {"agent_used": agent_type, "response": response}


orchestrator = AgentOrchestrator()
