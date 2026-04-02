import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { RuleCondition, RuleGroup } from '@/types/rule.types';
import { isRuleGroup, createRuleCondition, createEmptyRuleGroup } from '@/utils/ruleEvaluator';
import { Button } from '@/components/ui/button';
import RuleRow from './RuleRow';
import { cn } from '@/lib/utils';

const DEPTH_BORDER = [
  'rgba(156,29,38,0.55)',
  'rgba(201,162,39,0.45)',
  'rgba(245,158,11,0.45)',
  'rgba(236,72,153,0.45)',
];

interface RuleGroupContainerProps {
  group: RuleGroup;
  onChange: (next: RuleGroup) => void;
  depth: number;
  onRemove?: () => void;
}

function SortableChrome({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-start">
      <button
        type="button"
        className="mt-2 p-1 rounded-md hover:bg-black/[0.06] cursor-grab active:cursor-grabbing shrink-0"
        style={{ color: 'var(--text-secondary)' }}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function RuleGroupContainer({ group, onChange, depth, onRemove }: RuleGroupContainerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => group.conditions.map((c) => c.id), [group.conditions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange({ ...group, conditions: arrayMove(group.conditions, oldIndex, newIndex) });
  };

  const updateAt = (index: number, next: RuleCondition | RuleGroup) => {
    const list = [...group.conditions];
    list[index] = next;
    onChange({ ...group, conditions: list });
  };

  const removeAt = (index: number) => {
    onChange({ ...group, conditions: group.conditions.filter((_, i) => i !== index) });
  };

  const addCondition = () => {
    onChange({ ...group, conditions: [...group.conditions, createRuleCondition()] });
  };

  const addGroup = () => {
    onChange({ ...group, conditions: [...group.conditions, createEmptyRuleGroup()] });
  };

  const borderColor = DEPTH_BORDER[depth % DEPTH_BORDER.length];

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: 'var(--border)',
        borderLeftWidth: depth > 0 ? 4 : 1,
        borderLeftColor: depth > 0 ? borderColor : undefined,
        backgroundColor: depth > 0 ? 'var(--surface-subtle)' : 'transparent',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {depth > 0 && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="p-1 rounded-md hover:bg-black/[0.06]"
              style={{ color: 'var(--text-secondary)' }}
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {depth === 0 ? 'Rules' : 'Group'}
          </span>
          <select
            className="h-8 rounded-lg border bg-transparent px-2 text-xs font-semibold outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            value={group.logic}
            onChange={(e) => onChange({ ...group, logic: e.target.value as 'AND' | 'OR' })}
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
        {depth > 0 && onRemove && (
          <Button type="button" variant="ghost" size="sm" className="text-destructive h-8" onClick={onRemove}>
            Remove group
          </Button>
        )}
      </div>

      {!collapsed && (
        <>
          {group.conditions.length === 0 ? (
            <p className="text-sm py-6 text-center rounded-lg border border-dashed" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
              No rules defined — all transactions will qualify.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {group.conditions.map((item, idx) => {
                    if (isRuleGroup(item)) {
                      return (
                        <SortableChrome key={item.id} id={item.id}>
                          <RuleGroupContainer
                            group={item}
                            depth={depth + 1}
                            onChange={(next) => updateAt(idx, next)}
                            onRemove={() => removeAt(idx)}
                          />
                        </SortableChrome>
                      );
                    }
                    return (
                      <SortableChrome key={item.id} id={item.id}>
                        <RuleRow
                          condition={item}
                          onChange={(next) => updateAt(idx, next)}
                          onRemove={() => removeAt(idx)}
                        />
                      </SortableChrome>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className={cn('flex flex-wrap gap-2 mt-4', group.conditions.length === 0 && 'mt-0')}>
            <Button type="button" variant="outline" size="sm" onClick={addCondition}>
              + Add condition
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addGroup}>
              + Add group
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
