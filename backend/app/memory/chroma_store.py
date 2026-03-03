import chromadb
from chromadb.utils import embedding_functions
from datetime import datetime
from app.core.config import settings


class ChromaMemoryStore:
    """
    Local vector memory using ChromaDB.
    No API key needed — data is stored in ./chroma_db folder.
    Each document = one interaction, filtered by project_id.
    """

    def __init__(self):
        # Persistent client that saves data to disk
        self.client = chromadb.PersistentClient(path="./chroma_db")

        # OpenAI embeddings for vectorization
        self.embed_fn = embedding_functions.OpenAIEmbeddingFunction(
            api_key=settings.OPENAI_API_KEY,
            api_base=settings.OPENAI_BASE_URL,
            model_name="text-embedding-3-small"
        )

        # One collection for all interactions across all projects
        self.collection = self.client.get_or_create_collection(
            name="mindall_memory",
            embedding_function=self.embed_fn
        )

    def save_interaction(self, project_id: int, query: str, response: str, agent_type: str):
        """Save a Q&A interaction to ChromaDB."""
        doc_id = f"proj-{project_id}-{datetime.utcnow().timestamp()}"
        text = f"Question: {query}\nAnswer: {response}"

        self.collection.add(
            ids=[doc_id],
            documents=[text],
            metadatas=[{
                "project_id": str(project_id),
                "agent_type": agent_type,
                "query": query,
                "response": response[:1000],
                "timestamp": datetime.utcnow().isoformat()
            }]
        )

    def retrieve_context(self, project_id: int, query: str, top_k: int = 3) -> str:
        """Retrieve the most relevant past interactions for a given query."""
        # Check if collection has any docs for this project first
        existing = self.collection.get(
            where={"project_id": str(project_id)}
        )
        if not existing["ids"]:
            return "No previous context found."

        results = self.collection.query(
            query_texts=[query],
            n_results=min(top_k, len(existing["ids"])),
            where={"project_id": str(project_id)}
        )

        if not results["documents"] or not results["documents"][0]:
            return "No previous context found."

        context_parts = []
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i]
            context_parts.append(
                f"[{meta.get('agent_type', 'general')}] "
                f"Q: {meta.get('query', '')} → "
                f"A: {meta.get('response', '')}"
            )

        return "\n".join(context_parts)


# Singleton instance
memory_store = ChromaMemoryStore()