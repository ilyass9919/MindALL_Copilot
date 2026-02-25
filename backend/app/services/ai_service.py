from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings

class MindAllAIService:
    def __init__(self):
        self.llm = ChatOpenAI(
            # GitHub Models are OpenAI-compatible!
            api_key=settings.OPENAI_API_KEY, 
            base_url=settings.OPENAI_BASE_URL, 
            model="gpt-4o-mini", # You can also use "meta-llama-3-70b-instruct" here!
            temperature=0.7
        )
    
    def analyze_project(self, title: str, industry: str, description: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI Co-founder for MindAll Consulting. Provide a SWOT analysis and one actionable next step."),
            ("user", "Project: {title}\nIndustry: {industry}\nDescription: {description}")
        ])
        
        chain = prompt | self.llm
        response = chain.invoke({
            "title": title,
            "industry": industry,
            "description": description
        })
        
        return response.content

ai_service = MindAllAIService()