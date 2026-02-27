from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from app.core.config import settings
from datetime import datetime
import json


class PineconeMemoryStore:
    """
    Handles saving and retrieving conversation context from Pinecone.
    Each vector = one interaction, tagged with project_id and agent_type.
    """

    INDEX_NAME = "mindall-memory"
    DIMENSION = 1536  # text-embedding-3-small dimension

    def __init__(self):
        # Initialize Pinecone client
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)

        # Create index if it doesn't exist
        existing = [i.name for i in pc.list_indexes()]
        if self.INDEX_NAME not in existing:
            pc.create_index(
                name=self.INDEX_NAME,
                dimension=self.DIMENSION,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )

        self.index = pc.Index(self.INDEX_NAME)

        # Use OpenAI embeddings 
        self.embeddings = OpenAIEmbeddings(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            model="text-embedding-3-small"
        )

    def save_interaction(self, project_id: int, query: str, response: str, agent_type: str):
        """Save a Q&A interaction to Pinecone memory."""
        text = f"Question: {query}\nAnswer: {response}"
        vector = self.embeddings.embed_query(text)

        self.index.upsert(vectors=[{
            "id": f"proj-{project_id}-{datetime.utcnow().timestamp()}",
            "values": vector,
            "metadata": {
                "project_id": str(project_id),
                "agent_type": agent_type,
                "query": query,
                "response": response[:500],  # Pinecone metadata limit
                "timestamp": datetime.utcnow().isoformat()
            }
        }])

    def retrieve_context(self, project_id: int, query: str, top_k: int = 3) -> str:
        """Retrieve the most relevant past interactions for a given query."""
        vector = self.embeddings.embed_query(query)

        results = self.index.query(
            vector=vector,
            top_k=top_k,
            filter={"project_id": {"$eq": str(project_id)}},
            include_metadata=True
        )

        if not results.matches:
            return "No previous context found."

        context_parts = []
        for match in results.matches:
            meta = match.metadata
            context_parts.append(
                f"[{meta.get('agent_type', 'general')}] "
                f"Q: {meta.get('query', '')} → "
                f"A: {meta.get('response', '')}"
            )

        return "\n".join(context_parts)


# Singleton instance
memory_store = PineconeMemoryStore()