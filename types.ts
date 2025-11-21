import { Node, Edge } from 'reactflow';

export interface PipelineResponse {
  num_nodes: number;
  num_edges: number;
  is_dag: boolean;
  variables?: string[]; // Added to support variable detection feedback
}

// Generic data structure for nodes
export interface NodeData {
  label?: string;
  text?: string;
  inputType?: string;
  outputType?: string;
  [key: string]: any;
}

// Type alias for our specific nodes
export type AppNode = Node<NodeData>;
export type AppEdge = Edge;