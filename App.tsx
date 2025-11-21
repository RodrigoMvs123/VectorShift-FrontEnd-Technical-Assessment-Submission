
import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Node,
  MarkerType,
} from 'reactflow';
import { parsePipeline } from './services/api';
import { InputNode, OutputNode, LLMNode } from './components/nodes/StandardNodes';
import { TextNode } from './components/nodes/TextNode';
import { ApiNode, ConditionalNode, TransformNode, DatabaseNode, DelayNode } from './components/nodes/CustomNodes';

const initialNodes: Node[] = [
  { id: '1', type: 'customInput', position: { x: 100, y: 100 }, data: { id: '1', inputType: 'Text' } },
  { id: '2', type: 'llm', position: { x: 450, y: 150 }, data: { id: '2' } },
  { id: '3', type: 'customOutput', position: { x: 800, y: 100 }, data: { id: '3', outputType: 'Text' } },
  { id: '4', type: 'text', position: { x: 450, y: 450 }, data: { text: 'My variable is {{ name }}' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', targetHandle: 'system', animated: true },
  { id: 'e2-3', source: '2', target: '3', sourceHandle: 'response', animated: true },
];

// --- Types for Notification ---
interface NotificationState {
  title: string;
  message: string;
  details?: string[];
  type: 'success' | 'error';
}

function PipelineBuilder() {
  const nodeTypes = useMemo(() => ({
    customInput: InputNode,
    llm: LLMNode,
    customOutput: OutputNode,
    text: TextNode,
    api: ApiNode,
    conditional: ConditionalNode,
    transform: TransformNode,
    database: DatabaseNode,
    delay: DelayNode,
  }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(false);
  
  // New state for custom modal notification
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep', 
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      style: { stroke: '#6366f1', strokeWidth: 2 }
    }, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const id = `${type}-${nodes.length + 1}`;
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { label: `${type} node` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await parsePipeline(nodes, edges);
      
      setNotification({
        title: 'Pipeline Analysis Completed',
        message: `Metrics:\n• Nodes: ${result.num_nodes}\n• Edges: ${result.num_edges}\n• Structure: ${result.is_dag ? '✅ Valid (Acyclic)' : '❌ Invalid (Cyclic Detected)'}`,
        details: result.variables,
        type: 'success'
      });
    } catch (error) {
      setNotification({
        title: 'Analysis Failed',
        message: 'Could not connect to the analysis engine or simulation failed.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50">
      {/* Header / Toolbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-lg shadow-md">
            <i className="fas fa-project-diagram text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">VectorShift</h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Pipeline Builder</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-plus text-slate-400 text-xs"></i>
            </div>
            <select 
              onChange={(e) => { if(e.target.value) { addNode(e.target.value); e.target.value = ""; } }}
              className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors shadow-sm"
            >
              <option value="">Add Component</option>
              <optgroup label="Standard">
                <option value="customInput">Input</option>
                <option value="llm">LLM Engine</option>
                <option value="customOutput">Output</option>
                <option value="text">Text Transformer</option>
              </optgroup>
              <optgroup label="Advanced">
                <option value="api">API Integration</option>
                <option value="conditional">Logic Gate (If/Else)</option>
                <option value="transform">Data Transform</option>
                <option value="database">Database Query</option>
                <option value="delay">Time Delay</option>
              </optgroup>
            </select>
          </div>
          
          <div className="h-6 w-px bg-slate-200"></div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
              flex items-center gap-2 text-white text-sm font-semibold py-2 px-5 rounded-lg shadow-md transition-all
              ${isLoading 
                ? 'bg-slate-400 cursor-wait' 
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20 active:scale-95'}
            `}
          >
            {isLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin text-xs"></i>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <i className="fas fa-play text-xs"></i>
                <span>Run Pipeline</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-grow relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          }}
        >
          <Background color="#cbd5e1" gap={20} size={1.5} />
          <Controls 
            className="!bg-white !border !border-slate-200 !shadow-lg !rounded-lg !p-1"
            position="bottom-left"
          />
          <MiniMap 
            nodeStrokeColor="#6366f1" 
            nodeColor="#e0e7ff" 
            maskColor="rgba(241, 245, 249, 0.7)"
            className="!bg-white !border !border-slate-200 !rounded-lg !shadow-lg !m-4"
          />
        </ReactFlow>

        {/* Result Notification Modal */}
        {notification && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
              {/* Modal Header */}
              <div className={`px-6 py-4 border-b ${notification.type === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${notification.type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'}`}></i>
                  </div>
                  <h3 className={`text-lg font-bold ${notification.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                    {notification.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed font-medium">
                  {notification.message}
                </div>
                
                {notification.details && notification.details.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-code text-slate-400 text-xs"></i>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detected Variables</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {notification.details.map((v, i) => (
                        <span key={`${v}-${i}`} className="px-2.5 py-1 bg-white border border-slate-200 text-brand-600 text-xs rounded-md font-mono font-medium shadow-sm">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setNotification(null)}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <PipelineBuilder />
    </ReactFlowProvider>
  );
}
