from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

# Allow CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Node(BaseModel):
    id: str
    type: str
    data: Dict[str, Any] = {}

class Edge(BaseModel):
    id: str
    source: str
    target: str

class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@app.get("/")
def read_root():
    return {"status": "VectorShift Backend Running"}

@app.post("/pipelines/parse")
async def parse_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    
    # 1. Build Adjacency List
    # Map: node_id -> list of target node_ids
    adj = {node.id: [] for node in pipeline.nodes}
    for edge in pipeline.edges:
        if edge.source in adj:
            adj[edge.source].append(edge.target)
            
    # 2. Check for Cycles (DAG verification) using DFS
    visited = set()
    recursion_stack = set()
    is_dag = True
    
    def has_cycle(node_id):
        visited.add(node_id)
        recursion_stack.add(node_id)
        
        # Visit neighbors
        for neighbor in adj.get(node_id, []):
            if neighbor not in visited:
                if has_cycle(neighbor):
                    return True
            elif neighbor in recursion_stack:
                return True
                
        recursion_stack.remove(node_id)
        return False
        
    # Iterate through all nodes to handle disconnected components
    for node in pipeline.nodes:
        if node.id not in visited:
            if has_cycle(node.id):
                is_dag = False
                break
                
    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": is_dag
    }
