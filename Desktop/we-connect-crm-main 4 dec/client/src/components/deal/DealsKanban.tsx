import React, { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, useDroppable, useSensor, useSensors, PointerSensor, KeyboardSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Button } from '../ui';
import { Deal } from '../../services/dealService';
import { DealStage } from '../../features/business-settings/types';
import { Plus } from 'lucide-react';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';

interface DealsKanbanProps {
  deals: Deal[];
  stages: DealStage[];
  onUpdateStage: (dealId: number, newStage: string) => Promise<void> | void;
  onCreateDeal?: () => void;
}

const DealsKanban: React.FC<DealsKanbanProps> = ({ deals, stages, onUpdateStage, onCreateDeal }) => {
  const { formatCurrency } = useBusinessSettings();
  const [dragging, setDragging] = useState<null | { id: number }>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const columns = useMemo(() => {
    const byStage: Record<string, Deal[]> = {};
    stages
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach(s => { byStage[s.name] = []; });

    for (const d of deals) {
      const stageName = d.stage || stages[0]?.name || 'Uncategorized';
      if (!byStage[stageName]) byStage[stageName] = [];
      byStage[stageName].push(d);
    }
    return byStage;
  }, [deals, stages]);

  const idToStage = useMemo(() => {
    const map: Record<number, string> = {};
    for (const [stageName, list] of Object.entries(columns)) {
      for (const d of list) map[d.id] = stageName;
    }
    return map;
  }, [columns]);

  const handleDragEnd = async (event: DragEndEvent) => {
    setDragging(null);
    const activeId = event.active?.id as number | undefined;
    const overRaw = event.over?.id as any;
    if (!activeId || overRaw == null) return;

    let targetStage: string | null = null;
    if (typeof overRaw === 'string') {
      targetStage = overRaw; // dropped over column
    } else if (typeof overRaw === 'number') {
      targetStage = idToStage[overRaw] || null; // dropped over another card
    }
    const currentStage = idToStage[activeId];
    if (targetStage && targetStage !== currentStage) {
      await onUpdateStage(activeId, targetStage);
    }
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[900px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={({ active }) => setDragging({ id: active.id as number })}>
          {stages
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((stage) => (
              <div key={stage.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
                    <span className="text-xs text-gray-500">{columns[stage.name]?.length || 0}</span>
                  </div>
                  {onCreateDeal && (
                    <Button size="SM" variant="OUTLINE" onClick={onCreateDeal} className="flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  )}
                </div>

                <KanbanColumn id={stage.name}>
                  <Card className="p-2 min-h-[480px] bg-gray-50 dark:bg-gray-900/40">
                    <SortableContext items={(columns[stage.name] || []).map(d => d.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {(columns[stage.name] || []).map((deal) => (
                          <KanbanCard key={deal.id} id={deal.id}>
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-move shadow-sm">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{deal.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {deal.companies?.name || deal.contact ? `${deal.contact?.firstName || ''} ${deal.contact?.lastName || ''}`.trim() : '-'}
                              </div>
                              <div className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(deal.value, deal.currency)}
                              </div>
                            </div>
                          </KanbanCard>
                        ))}
                      </div>
                    </SortableContext>
                  </Card>
                </KanbanColumn>
              </div>
            ))}
        </DndContext>
      </div>
    </div>
  );
};

// Internal components
const KanbanColumn: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} data-column-id={id} className={isOver ? 'ring-2 ring-blue-400 rounded-md' : ''}>
      {children}
    </div>
  );
};

const KanbanCard: React.FC<{ id: number; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export default DealsKanban;
