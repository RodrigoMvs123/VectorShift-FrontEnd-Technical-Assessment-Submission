
import React, { ReactNode, useEffect, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import type { NodeConfig } from './nodeConfigs';

// Definition for a handle configuration
export interface BaseNodeHandle {
  id: string;
  type: 'source' | 'target';
  position: Position;
  style?: React.CSSProperties;
  label?: string;
}

export interface BaseNodeProps {
  id: string;
  data?: any;
  config?: NodeConfig;
  title?: string;
  icon?: string;
  children?: ReactNode;
  handles?: BaseNodeHandle[];
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties; // Allow dynamic style overrides
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  data,
  config,
  title,
  icon,
  children,
  handles: manualHandles,
  selected,
  className = "",
  style = {},
}) => {
  const { deleteElements } = useReactFlow();

  // --- ABSTRACTION STATE MANAGEMENT ---
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    const initialState: Record<string, any> = {};
    if (config?.fields) {
      config.fields.forEach(field => {
        // Use data if it exists, otherwise default value
        initialState[field.name] = data?.[field.name] !== undefined 
          ? data[field.name] 
          : (typeof field.defaultValue === 'function' 
              ? field.defaultValue(id) 
              : field.defaultValue);
      });
    }
    return initialState;
  });

  useEffect(() => {
    if (data && config) {
      Object.assign(data, fieldValues);
    }
  }, [fieldValues, data, config]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
  };

  // --- RENDERING LOGIC ---
  
  // Determine dimensions from config or use auto/style
  const nodeWidth = style.width || config?.width || 'auto';
  const nodeHeight = style.height || config?.height || 'auto';

  // Merge manual handles with config handles
  const configHandles: BaseNodeHandle[] = (config?.handles || []).map(h => ({
    id: h.id,
    type: h.type,
    position: Position[h.position as keyof typeof Position] || Position.Right,
    style: h.style
  }));
  
  const allHandles = [...configHandles, ...(manualHandles || [])];

  return (
    <div 
      className={`
        relative bg-white rounded-xl border-2 transition-all duration-200
        ${selected ? 'border-brand-500 shadow-node-selected' : 'border-slate-200 hover:border-brand-300 shadow-node hover:shadow-node-hover'}
        ${className}
      `}
      style={{ width: nodeWidth, height: nodeHeight, ...style }}
    >
      {/* Header */}
      <div className="flex items-center px-3 py-2 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
        <div className="flex items-center gap-2 text-slate-700">
          <i className={`${icon || 'fas fa-cube'} text-xs opacity-60`}></i>
          <span className="text-xs font-semibold tracking-tight">
            {title || config?.title || 'Node'}
          </span>
        </div>
        {/* Delete Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent node selection when clicking delete
            deleteElements({ nodes: [{ id }] });
          }}
          className="ml-auto text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-3">
        {/* Render Config Fields */}
        {config?.fields && config.fields.map(field => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">
              {field.label}
            </label>
            
            {/* Select Field */}
            {field.type === 'select' ? (
              <select
                value={fieldValues[field.name]}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="nodrag w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              >
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>

            // Textarea Field
            ) : field.type === 'textarea' ? (
              <textarea
                value={fieldValues[field.name]}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                rows={field.rows || 2}
                className="nodrag w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              />
            
            // Number Field
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={fieldValues[field.name]}
                min={field.min}
                max={field.max}
                step={field.step}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="nodrag w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />

            // Password or Text Field
            ) : (
              <input
                type={field.type}
                value={fieldValues[field.name]}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="nodrag w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            )}
          </div>
        ))}

        {/* Render Children (Custom Content) */}
        {children}
      </div>

      {/* Handles */}
      {allHandles.map((handle, index) => (
        <Handle
          key={`${handle.id}-${index}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className={`
            !w-3 !h-3 !bg-white !border-2
            ${handle.type === 'target' ? '!border-brand-500' : '!border-indigo-400'}
            hover:!bg-brand-50 hover:!scale-125 transition-transform
          `}
          style={handle.style}
        />
      ))}
    </div>
  );
};
