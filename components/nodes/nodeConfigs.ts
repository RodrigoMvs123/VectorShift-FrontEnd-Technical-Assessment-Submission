
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'password' | 'number';
  options?: string[];
  defaultValue?: string | number | ((id: string) => string);
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface HandleConfig {
  id: string;
  type: 'source' | 'target';
  position: 'Left' | 'Right' | 'Top' | 'Bottom';
  style?: React.CSSProperties;
  label?: string;
}

export interface NodeConfig {
  title: string;
  description?: string | null;
  width?: number;
  height?: number | string;
  fields: FieldConfig[];
  handles: HandleConfig[];
}

export const nodeConfigs: Record<string, NodeConfig> = {
  // INPUT NODE
  input: {
    title: 'Input',
    description: null,
    width: 250,
    fields: [
      {
        name: 'inputName',
        label: 'Name',
        type: 'text',
        defaultValue: (id: string) => id.replace('customInput-', 'input_')
      },
      {
        name: 'inputType',
        label: 'Type',
        type: 'select',
        options: ['Text', 'File'],
        defaultValue: 'Text'
      }
    ],
    handles: [
      { type: 'source', position: 'Right', id: 'value' }
    ]
  },

  // OUTPUT NODE
  output: {
    title: 'Output',
    description: null,
    width: 250,
    fields: [
      {
        name: 'outputName',
        label: 'Name',
        type: 'text',
        defaultValue: (id: string) => id.replace('customOutput-', 'output_')
      },
      {
        name: 'outputType',
        label: 'Type',
        type: 'select',
        options: ['Text', 'Image'],
        defaultValue: 'Text'
      }
    ],
    handles: [
      { type: 'target', position: 'Left', id: 'value' }
    ]
  },

  // LLM NODE
  llm: {
    title: 'LLM',
    description: 'This is a Large Language Model.',
    width: 280,
    height: 'auto',
    fields: [
       {
        name: 'model',
        label: 'Model',
        type: 'select',
        options: ['gpt-3.5-turbo', 'gpt-4', 'gemini-pro', 'claude-3'],
        defaultValue: 'gpt-3.5-turbo'
      },
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        defaultValue: ''
      },
      {
        name: 'temperature',
        label: 'Temperature',
        type: 'number',
        defaultValue: 0.7,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        name: 'maxTokens',
        label: 'Max Tokens',
        type: 'number',
        defaultValue: 2000,
        step: 100
      }
    ],
    handles: [
      { type: 'target', position: 'Left', id: 'system', style: { top: '30%' } },
      { type: 'target', position: 'Left', id: 'prompt', style: { top: '70%' } },
      { type: 'source', position: 'Right', id: 'response' }
    ]
  },

  // TEXT NODE (Fallback config if used without custom logic)
  text: {
    title: 'Text',
    description: null,
    width: 250,
    fields: [
      { name: 'text', label: 'Text', type: 'textarea', rows: 1, defaultValue: '{{input}}' }
    ],
    handles: [
      { type: 'source', position: 'Right', id: 'output' }
    ]
  },

  // --- NEW CUSTOM NODES ---

  // 1. API ENDPOINT NODE
  api: {
    title: 'API',
    description: 'Make HTTP requests',
    width: 250,
    fields: [
      { name: 'url', label: 'URL', type: 'text', defaultValue: 'https://api.example.com' },
      { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], defaultValue: 'GET' }
    ],
    handles: [
      { type: 'target', position: 'Left', id: 'trigger' },
      { type: 'source', position: 'Right', id: 'response' }
    ]
  },

  // 2. CONDITIONAL NODE
  conditional: {
    title: 'Conditional',
    description: 'If/else logic',
    width: 250,
    fields: [
      { name: 'condition', label: 'Condition', type: 'text', defaultValue: 'value > 10' }
    ],
    handles: [
      { type: 'target', position: 'Left', id: 'input' },
      { type: 'source', position: 'Right', id: 'true', style: { top: '35%' } },
      { type: 'source', position: 'Right', id: 'false', style: { top: '65%' } }
    ]
  },

  // 3. TRANSFORM NODE
  transform: {
    title: 'Transform',
    description: 'Modify data',
    width: 250,
    fields: [
      { name: 'operation', label: 'Operation', type: 'select', options: ['Uppercase', 'Lowercase', 'Trim', 'Replace'], defaultValue: 'Uppercase' },
      { name: 'parameters', label: 'Parameters', type: 'text', defaultValue: '' }
    ],
    handles: [
      { type: 'target', position: 'Left', id: 'input' },
      { type: 'source', position: 'Right', id: 'output' }
    ]
  },

  // 4. DATABASE QUERY NODE
  database: {
    title: 'Database',
    description: 'Query database',
    width: 260,
    fields: [
      { name: 'table', label: 'Table', type: 'text', defaultValue: 'users' },
      { name: 'action', label: 'Action', type: 'select', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'], defaultValue: 'SELECT' },
      { name: 'query', label: 'Query', type: 'textarea', defaultValue: 'SELECT * FROM users', rows: 3 }
    ],
    handles: [
      { type: 'target', position: 'Left', id: 'params' },
      { type: 'source', position: 'Right', id: 'results' }
    ]
  },

  // 5. DELAY NODE
  delay: {
    title: 'Delay',
    description: 'Wait before continuing',
    width: 200,
    fields: [
      { name: 'duration', label: 'Duration (ms)', type: 'text', defaultValue: '1000' }
    ],
    handles: [
      { type: 'target', position: 'Left', id: 'input' },
      { type: 'source', position: 'Right', id: 'output' }
    ]
  }
};

export const getNodeConfig = (nodeType: string): NodeConfig => {
  return nodeConfigs[nodeType] || nodeConfigs.text;
};
