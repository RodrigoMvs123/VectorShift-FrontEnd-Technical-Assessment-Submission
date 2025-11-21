
import { PipelineResponse } from '../types';
import { Node, Edge } from 'reactflow';

export const parsePipeline = async (nodes: Node[], edges: Edge[]): Promise<PipelineResponse> => {
  const backendUrl = 'http://127.0.0.1:8000/pipelines/parse';
  
  // Prepare the payload as expected by the Pydantic model in backend
  const payload = {
    nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
    edges: edges.map(e => ({ source: e.source, target: e.target, id: e.id }))
  };

  try {
    // 1. Attempt to contact the real Python backend with a timeout
    // If backend is not running, fetch can hang. We abort after 1 second to fallback quickly.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
        return await response.json();
    } else {
        console.warn(`Backend returned status ${response.status}. Falling back to client-side calculation.`);
        throw new Error('Backend failed');
    }
  } catch (error) {
    console.warn("Backend unreachable (is main.py running?) or timed out. Using client-side simulation.", error);

    // --- FALLBACK / SIMULATION MODE ---
    // If backend fails, we calculate client-side so the UI still works for testing/demo.
    
    const num_nodes = nodes.length;
    const num_edges = edges.length;
    const is_dag = checkIsDag(nodes, edges);
    const variables = extractVariables(nodes);

    // Simulate a small network delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      num_nodes,
      num_edges,
      is_dag,
      variables
    };
  }
};

// Client-side helper to simulate backend DAG check
function checkIsDag(nodes: Node[], edges: Edge[]): boolean {
    // 1. Build Adjacency List
    const adjacency = new Map<string, string[]>();
    nodes.forEach(n => adjacency.set(n.id, []));
    edges.forEach(e => {
        if (adjacency.has(e.source)) {
            adjacency.get(e.source)?.push(e.target);
        }
    });

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function hasCycle(nodeId: string): boolean {
        visited.add(nodeId);
        recursionStack.add(nodeId);

        const neighbors = adjacency.get(nodeId) || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (hasCycle(neighbor)) return true;
            } else if (recursionStack.has(neighbor)) {
                return true;
            }
        }

        recursionStack.delete(nodeId);
        return false;
    }

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            if (hasCycle(node.id)) return false;
        }
    }
    return true;
}

// Client-side helper to extract variables from nodes (mimicking backend logic)
function extractVariables(nodes: Node[]): string[] {
  const variables = new Set<string>();
  const regex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

  nodes.forEach(node => {
    // Check text data in TextNodes or any node with a 'text' field
    if (node.data && typeof node.data.text === 'string') {
      const matches = [...node.data.text.matchAll(regex)];
      matches.forEach(m => variables.add(m[1]));
    }
  });

  return Array.from(variables);
}
