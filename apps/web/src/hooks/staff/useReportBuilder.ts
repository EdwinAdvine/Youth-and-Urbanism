/**
 * Report Builder Hook
 *
 * Manages the drag-and-drop state machine for the custom report builder.
 * Handles widget CRUD operations, positioning, sizing, selection state,
 * and serialization/deserialization of report configurations.
 */

import { useState, useCallback, useRef } from 'react';

interface ReportWidget {
  /** Unique widget identifier */
  id: string;
  /** Widget visualization type */
  type: 'metric_card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'data_table' | 'text_block';
  /** Widget display title */
  title: string;
  /** API data source identifier */
  dataSource?: string;
  /** Grid position and dimensions */
  position: { x: number; y: number; w: number; h: number };
  /** Widget-specific configuration */
  config: Record<string, unknown>;
}

interface ReportBuilderConfig {
  widgets: ReportWidget[];
  layout_columns: number;
}

interface UseReportBuilderResult {
  /** Current list of widgets */
  widgets: ReportWidget[];
  /** Currently selected widget ID */
  selectedWidgetId: string | null;
  /** Whether unsaved changes exist */
  isDirty: boolean;
  /** Add a new widget of the given type */
  addWidget: (type: ReportWidget['type']) => void;
  /** Remove a widget by ID */
  removeWidget: (id: string) => void;
  /** Update widget properties */
  updateWidget: (id: string, updates: Partial<ReportWidget>) => void;
  /** Move a widget to a new position */
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  /** Resize a widget */
  resizeWidget: (id: string, size: { w: number; h: number }) => void;
  /** Select a widget (or deselect with null) */
  selectWidget: (id: string | null) => void;
  /** Serialize current state to JSON config */
  toJSON: () => ReportBuilderConfig;
  /** Load state from a JSON config */
  fromJSON: (config: ReportBuilderConfig) => void;
  /** Reset to empty state */
  reset: () => void;
}

/** Default grid dimensions for each widget type */
const DEFAULT_SIZES: Record<ReportWidget['type'], { w: number; h: number }> = {
  metric_card: { w: 3, h: 2 },
  line_chart: { w: 6, h: 4 },
  bar_chart: { w: 6, h: 4 },
  pie_chart: { w: 4, h: 4 },
  data_table: { w: 12, h: 6 },
  text_block: { w: 6, h: 2 },
};

/** Human-readable default titles for each widget type */
const DEFAULT_TITLES: Record<ReportWidget['type'], string> = {
  metric_card: 'Metric Card',
  line_chart: 'Line Chart',
  bar_chart: 'Bar Chart',
  pie_chart: 'Pie Chart',
  data_table: 'Data Table',
  text_block: 'Text Block',
};

const LAYOUT_COLUMNS = 12;

/**
 * Find the next available Y position that avoids overlapping with
 * existing widgets. Uses a simple bottom-stacking approach.
 */
function findNextYPosition(widgets: ReportWidget[]): number {
  if (widgets.length === 0) return 0;

  let maxBottom = 0;
  for (const widget of widgets) {
    const bottom = widget.position.y + widget.position.h;
    if (bottom > maxBottom) {
      maxBottom = bottom;
    }
  }
  return maxBottom;
}

export function useReportBuilder(initialConfig?: ReportBuilderConfig): UseReportBuilderResult {
  const [widgets, setWidgets] = useState<ReportWidget[]>(
    initialConfig?.widgets ?? []
  );
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Counter for generating sequential widget IDs within this session
  const idCounterRef = useRef(0);

  /**
   * Generate a unique widget ID.
   */
  const generateId = useCallback((): string => {
    idCounterRef.current += 1;
    return `widget_${Date.now()}_${idCounterRef.current}`;
  }, []);

  /**
   * Add a new widget of the specified type. The widget is placed at the
   * bottom of the current layout.
   */
  const addWidget = useCallback(
    (type: ReportWidget['type']) => {
      const defaultSize = DEFAULT_SIZES[type];
      const newWidget: ReportWidget = {
        id: generateId(),
        type,
        title: DEFAULT_TITLES[type],
        dataSource: undefined,
        position: {
          x: 0,
          y: findNextYPosition(widgets),
          ...defaultSize,
        },
        config: {},
      };

      setWidgets((prev) => [...prev, newWidget]);
      setSelectedWidgetId(newWidget.id);
      setIsDirty(true);
    },
    [generateId, widgets]
  );

  /**
   * Remove a widget by its ID.
   */
  const removeWidget = useCallback(
    (id: string) => {
      setWidgets((prev) => prev.filter((w) => w.id !== id));
      setSelectedWidgetId((prev) => (prev === id ? null : prev));
      setIsDirty(true);
    },
    []
  );

  /**
   * Update a widget's properties by merging partial updates.
   */
  const updateWidget = useCallback(
    (id: string, updates: Partial<ReportWidget>) => {
      setWidgets((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          return {
            ...w,
            ...updates,
            // Deep merge position if provided
            position: updates.position
              ? { ...w.position, ...updates.position }
              : w.position,
            // Deep merge config if provided
            config: updates.config
              ? { ...w.config, ...updates.config }
              : w.config,
          };
        })
      );
      setIsDirty(true);
    },
    []
  );

  /**
   * Move a widget to a new grid position (x, y).
   */
  const moveWidget = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setWidgets((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;
          return {
            ...w,
            position: {
              ...w.position,
              x: Math.max(0, Math.min(position.x, LAYOUT_COLUMNS - w.position.w)),
              y: Math.max(0, position.y),
            },
          };
        })
      );
      setIsDirty(true);
    },
    []
  );

  /**
   * Resize a widget to new dimensions (w, h).
   */
  const resizeWidget = useCallback(
    (id: string, size: { w: number; h: number }) => {
      setWidgets((prev) =>
        prev.map((widget) => {
          if (widget.id !== id) return widget;
          const clampedW = Math.max(1, Math.min(size.w, LAYOUT_COLUMNS - widget.position.x));
          const clampedH = Math.max(1, size.h);
          return {
            ...widget,
            position: {
              ...widget.position,
              w: clampedW,
              h: clampedH,
            },
          };
        })
      );
      setIsDirty(true);
    },
    []
  );

  /**
   * Select a widget by ID or deselect with null.
   */
  const selectWidget = useCallback((id: string | null) => {
    setSelectedWidgetId(id);
  }, []);

  /**
   * Serialize the current report builder state to a JSON-compatible config.
   */
  const toJSON = useCallback((): ReportBuilderConfig => {
    return {
      widgets: widgets.map((w) => ({
        id: w.id,
        type: w.type,
        title: w.title,
        dataSource: w.dataSource,
        position: { ...w.position },
        config: { ...w.config },
      })),
      layout_columns: LAYOUT_COLUMNS,
    };
  }, [widgets]);

  /**
   * Load a report configuration from JSON, replacing the current state.
   */
  const fromJSON = useCallback((config: ReportBuilderConfig) => {
    try {
      if (config && Array.isArray(config.widgets)) {
        const loaded = config.widgets.map((w) => ({
          id: w.id || crypto.randomUUID(),
          type: w.type,
          title: w.title || DEFAULT_TITLES[w.type] || 'Widget',
          dataSource: w.dataSource,
          position: w.position || { x: 0, y: 0, w: 6, h: 4 },
          config: w.config || {},
        }));
        setWidgets(loaded);
        setSelectedWidgetId(null);
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Failed to load report config:', err);
    }
  }, []);

  /**
   * Reset the report builder to an empty state.
   */
  const reset = useCallback(() => {
    setWidgets([]);
    setSelectedWidgetId(null);
    setIsDirty(false);
    idCounterRef.current = 0;
  }, []);

  return {
    widgets,
    selectedWidgetId,
    isDirty,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    resizeWidget,
    selectWidget,
    toJSON,
    fromJSON,
    reset,
  };
}

export type { ReportWidget, ReportBuilderConfig, UseReportBuilderResult };
export default useReportBuilder;
