import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeConfigs } from './nodeConfigs';

// --- Input Node ---
export const InputNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      selected={selected} 
      config={nodeConfigs.input} 
      icon="fas fa-sign-in-alt"
    />
  );
};

// --- Output Node ---
export const OutputNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      selected={selected} 
      config={nodeConfigs.output} 
      icon="fas fa-sign-out-alt"
    />
  );
};

// --- LLM Node ---
export const LLMNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      selected={selected} 
      config={nodeConfigs.llm} 
      icon="fas fa-brain"
    />
  );
};
