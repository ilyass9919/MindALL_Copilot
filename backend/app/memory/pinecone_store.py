from pinecone import Pinecone, ServerlessSpec
from openai import AzureOpenAI
from datetime import datetime
from app.core.config import settings
import hashlib


class PineconeMemoryStore:
    """
    Cloud vector memory using Pinecone Serverless (free tier).
    Replaces ChromaDB — survives server restarts, no disk needed.

    Each vector = one Q&A interaction, namespaced by project_id.
    Uses OpenAI text-embedding-3-small to generate embeddings.
    """

    INDEX_NAME = "mindall-memory"
    DIMENSION  = 1536          # text-embedding-3-small output size
    METRIC     = "cosine"

    def __init__(self):
        # Pinecone client
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)

        # Create index if it doesn't exist yet
        existing = [i.name for i in self.pc.list_indexes()]
        if self.INDEX_NAME not in existing:
            self.pc.create_index(
                name=self.INDEX_NAME,
                dimension=self.DIMENSION,
                metric=self.METRIC,
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"  
                )
            )

        self.index = self.pc.Index(self.INDEX_NAME)

        # OpenAI embeddings client 
        self.embed_client = AzureOpenAI(
            api_key=settings.OPENAI_API_KEY,
            azure_endpoint=settings.OPENAI_BASE_URL,
            api_version="2024-02-01"
        )

    def _embed(self, text: str) -> list[float]:
        """Generate an embedding vector for a text string."""
        response = self.embed_client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding

    def _make_id(self, project_id: int, query: str) -> str:
        """Create a stable unique ID for a vector."""
        raw = f"proj-{project_id}-{query}-{datetime.utcnow().timestamp()}"
        return hashlib.md5(raw.encode()).hexdigest()

    def save_interaction(self, project_id: int, query: str, response: str, agent_type: str):
        """Embed and store a Q&A interaction in Pinecone."""
        text = f"Question: {query}\nAnswer: {response}"
        try:
            vector = self._embed(text)
            self.index.upsert(
                vectors=[{
                    "id": self._make_id(project_id, query),
                    "values": vector,
                    "metadata": {
                        "project_id": str(project_id),
                        "agent_type": agent_type,
                        "query": query,
                        "response": response[:1000],    # Pinecone metadata limit
                        "timestamp": datetime.utcnow().isoformat()
                    }
                }],
                namespace=f"project-{project_id}"       # isolate per project
            )
        except Exception as e:
            # Memory save failing should never crash the chat
            print(f"[PineconeMemory] save_interaction error: {e}")

    def retrieve_context(self, project_id: int, query: str, top_k: int = 3) -> str:
        """Retrieve the most semantically relevant past interactions."""
        try:
            vector = self._embed(query)
            results = self.index.query(
                vector=vector,
                top_k=top_k,
                namespace=f"project-{project_id}",
                include_metadata=True
            )

            if not results.matches:
                return "No previous context found."

            # Only use results with reasonable similarity (score > 0.5)
            relevant = [m for m in results.matches if m.score > 0.5]
            if not relevant:
                return "No previous context found."

            parts = []
            for match in relevant:
                meta = match.metadata
                parts.append(
                    f"[{meta.get('agent_type', 'general')}] "
                    f"Q: {meta.get('query', '')} → "
                    f"A: {meta.get('response', '')}"
                )

            return "\n".join(parts)

        except Exception as e:
            print(f"[PineconeMemory] retrieve_context error: {e}")
            return "No previous context found."

    def delete_project_memory(self, project_id: int):
        """Delete all vectors for a project (useful for cleanup)."""
        try:
            self.index.delete(
                delete_all=True,
                namespace=f"project-{project_id}"
            )
        except Exception as e:
            print(f"[PineconeMemory] delete error: {e}")


# Singleton — initialized once when the backend starts
memory_store = PineconeMemoryStore()