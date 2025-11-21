
import React, { useState, useEffect, useRef, ChangeEvent, useLayoutEffect } from 'react';
import { Position, NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import type { BaseNodeHandle } from './BaseNode';

export const TextNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const [variableHandles, setVariableHandles] = useState<BaseNodeHandle[]>([]);
  const [nodeDimensions, setNodeDimensions] = useState({ width: 200, height: 150 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  // --- PART 3: DYNAMIC RESIZING ---
  useLayoutEffect(() => {
    if (ghostRef.current && textareaRef.current) {
      const ghost = ghostRef.current;
      
      // Reset ghost to minimal state to measure content
      ghost.style.width = 'auto';
      ghost.innerText = currText;

      // Configuration for resizing
      const minWidth = 200;
      const maxWidth = 400;
      const baseHeight = 100; // Header + margins roughly
      const padding = 24; // Textarea padding

      // 1. Measure required width
      // We add a little buffer to prevent jitter
      let newWidth = ghost.scrollWidth + padding;
      
      // Clamp width
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;

      // 2. Measure required height
      // Now that we know the width, force the ghost to that width to measure height (wrapping)
      ghost.style.width = `${newWidth - padding}px`;
      
      // Extra logic to handle empty newlines or single lines properly
      const lineCount = currText.split('\n').length;
      const contentHeight = Math.max(ghost.scrollHeight, lineCount * 20); 

      const newHeight = baseHeight + contentHeight;

      setNodeDimensions({
        width: newWidth,
        height: newHeight
      });
    }
  }, [currText]);

  // --- PART 3: VARIABLE EXTRACTION ---
  useEffect(() => {
    // Regex to match {{ variableName }}
    // Matches alphanumeric + underscore, must start with letter/underscore
    const regex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    const matches = [...currText.matchAll(regex)];
    const variables = Array.from(new Set(matches.map((m) => m[1]))); // Deduplicate

    // Create handles for each variable
    const newHandles: BaseNodeHandle[] = variables.map((variable, index) => ({
      id: `${id}-${variable}`,
      type: 'target',
      position: Position.Left,
      // Distribute handles dynamically along the left side
      // Start a bit down (top: 80px) and spacing of 30px
      style: { top: `${85 + index * 30}px` }, 
      label: variable,
    }));

    setVariableHandles(newHandles);
  }, [currText, id]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrText(e.target.value);
    data.text = e.target.value;
  };

  // Define base handles (Output) + Dynamic Variable handles (Inputs)
  const handles: BaseNodeHandle[] = [
    { id: 'output', type: 'source', position: Position.Right, style: { top: '50%' } },
    ...variableHandles,
  ];

  return (
    <BaseNode
      id={id}
      title="Text Node"
      icon="fas fa-font"
      selected={selected}
      handles={handles}
      style={{ width: nodeDimensions.width, height: nodeDimensions.height }}
      className="transition-all duration-100 ease-out"
    >
      <div className="flex flex-col h-full relative">
        <div className="flex justify-between items-center mb-2">
           <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">
             Text
           </label>
           {variableHandles.length > 0 && (
             <span className="text-[9px] text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded font-medium border border-brand-100">
               {variableHandles.length} variables
             </span>
           )}
        </div>
        
        {/* Actual Text Area */}
        <textarea
          ref={textareaRef}
          value={currText}
          onChange={handleTextChange}
          className="
            w-full flex-grow resize-none
            text-xs font-mono text-slate-600 leading-relaxed
            bg-slate-50 border border-slate-200 rounded-md
            px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white
            transition-colors overflow-hidden
            placeholder:text-slate-400
          "
          placeholder="Type something... use {{var}} for variables."
          spellCheck={false}
        />

        {/* 
           Ghost Element for Sizing 
           - Invisible but rendered to the DOM
           - Copies font properties of the textarea
        */}
        <div
          ref={ghostRef}
          aria-hidden="true"
          className="
            absolute opacity-0 pointer-events-none
            text-xs font-mono leading-relaxed
            px-3 py-2 border border-transparent
            whitespace-pre-wrap break-words
          "
          style={{ 
             // Ensure these match the textarea exactly
             top: 0, left: 0,
          }}
        >
          {/* Add a zero-width space to force height on empty lines */}
          {currText || ' '}
        </div>
      </div>
    </BaseNode>
  );
};
