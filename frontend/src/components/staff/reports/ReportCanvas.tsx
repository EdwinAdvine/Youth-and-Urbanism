import React from 'react';
import { Trash2, Copy, Settings, GripVertical } from 'lucide-react';

interface ReportWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  config: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ReportCanvasProps {
  widgets: ReportWidget[];
  onUpdateWidget: (id: string, updates: Partial<ReportWidget>) => void;
  onDeleteWidget: (id: string) => void;
  onDuplicateWidget: (id: string) => void;
  selectedWidgetId?: string;
  onSelectWidget: (id: string | undefined) => void;
  isEditable: boolean;
}

const ReportCanvas: React.FC<ReportCanvasProps> = ({
  widgets,
  onUpdateWidget: _onUpdateWidget,
  onDeleteWidget,
  onDuplicateWidget,
  selectedWidgetId,
  onSelectWidget,
  isEditable,
}) => {
  const renderWidget = (widget: ReportWidget) => {
    const isSelected = widget.id === selectedWidgetId;

    return (
      <div
        key={widget.id}
        onClick={() => isEditable && onSelectWidget(widget.id)}
        className={`absolute p-4 rounded-lg transition-all ${
          isEditable ? 'cursor-move' : ''
        } ${
          isSelected
            ? 'bg-white dark:bg-[#181C1F] border-2 border-[#E40000] shadow-lg'
            : 'bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B]'
        }`}
        style={{
          left: `${widget.position.x}px`,
          top: `${widget.position.y}px`,
          width: `${widget.size.width}px`,
          height: `${widget.size.height}px`,
        }}
      >
        {isEditable && isSelected && (
          <div className="absolute -top-8 right-0 flex items-center gap-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateWidget(widget.id);
              }}
              className="p-1 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white rounded"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectWidget(widget.id);
              }}
              className="p-1 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white rounded"
              title="Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteWidget(widget.id);
              }}
              className="p-1 text-red-400/60 hover:text-red-400 rounded"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
        {isEditable && (
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-move">
            <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/20" />
          </div>
        )}
        <div className="h-full overflow-auto">
          {widget.type === 'metric' && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{widget.config.value || '0'}</p>
              <p className="text-sm text-gray-500 dark:text-white/50 mt-2">{widget.config.label || 'Metric'}</p>
            </div>
          )}
          {widget.type === 'chart' && (
            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-[#22272B]/30 rounded">
              <p className="text-xs text-gray-400 dark:text-white/30">{widget.config.chartType || 'Chart'} Chart</p>
            </div>
          )}
          {widget.type === 'table' && (
            <div className="h-full">
              <p className="text-xs text-gray-500 dark:text-white/50 mb-2">{widget.config.title || 'Table'}</p>
              <div className="bg-gray-100 dark:bg-[#22272B]/30 rounded h-[calc(100%-2rem)] flex items-center justify-center">
                <p className="text-xs text-gray-400 dark:text-white/30">Table data</p>
              </div>
            </div>
          )}
          {widget.type === 'text' && (
            <div className="text-sm text-gray-600 dark:text-white/70">{widget.config.content || 'Text widget'}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-full bg-gray-50 dark:bg-[#0F1112] rounded-xl border border-gray-200 dark:border-[#22272B] overflow-auto"
      style={{ minHeight: '600px' }}
      onClick={() => isEditable && onSelectWidget(undefined)}
    >
      {widgets.map(renderWidget)}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-white/30">Drag widgets from the palette to start building</p>
        </div>
      )}
    </div>
  );
};

export default ReportCanvas;
