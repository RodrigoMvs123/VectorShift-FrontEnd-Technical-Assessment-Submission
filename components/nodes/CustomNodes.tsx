import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeConfigs } from './nodeConfigs';

// 1. API Node
export const ApiNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      selected={selected} 
      config={nodeConfigs.api} 
      icon="fas fa-cloud"
    />
  );
};

// 2. Conditional Node
export const ConditionalNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      selected={selected} 
      config={nodeConfigs.conditional} 
      icon="fas fa-code-branch"
    />
  );
};

// 3. Transform Node
export const TransformNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      selected={selected} 
      config={nodeConfigs.transform} 
      icon="fas fa-magic"
    />
  );
};

// 4. Database Node
export const DatabaseNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      selected={selected} 
      config={nodeConfigs.database} 
      icon="fas fa-database"
    />
  );
};

// 5. Delay Node
export const DelayNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode 
      id={id} 
      data={data} 
      selected={selected} 
      config={nodeConfigs.delay} 
      icon="fas fa-clock"
    />
  );
};
