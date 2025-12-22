import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMenu } from '../contexts/MenuContext';
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: any;
  permission?: string;
  badge?: string;
  badgeColor?: string;
  children?: NavigationItem[];
}

interface SortableItemProps {
  id: string;
  item: NavigationItem;
  isActive: boolean;
  sidebarCollapsed: boolean;
  hoveredItem: string | null;
  onHover: (name: string | null) => void;
  onNavigate: (href: string) => void;
  activeHref: string;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  item,
  isActive,
  sidebarCollapsed,
  hoveredItem,
  onHover,
  onNavigate,
  activeHref,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children?.some(child => activeHref === child.href);

  React.useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = item.icon;
  const isHovered = hoveredItem === item.name;

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    if (item.children && item.children.length > 0 && !sidebarCollapsed) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else {
      onNavigate(item.href);
    }
  };

  if (sidebarCollapsed) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative"
      >
        <div
          className={`flex items-center justify-center h-11 md:h-10 px-3 md:px-2 rounded-lg text-sm font-medium cursor-pointer transition-colors group ${isActive || isChildActive
            ? "bg-weconnect-red text-white shadow-md"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            } ${isDragging ? "shadow-lg ring-2 ring-blue-400 dark:ring-blue-600" : ""}`}
          onMouseEnter={() => onHover(item.name)}
          onMouseLeave={() => onHover(null)}
          onClick={(e) => handleClick(e)}
        >
          <Icon size={20} className="md:w-[18px] md:h-[18px]" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
    >
      <div
        className={`flex items-center h-12 md:h-11 rounded-lg text-sm font-medium transition-colors group justify-between ${isActive || isChildActive
          ? "bg-weconnect-red text-white shadow-md"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          } ${isDragging ? "shadow-lg ring-2 ring-blue-400 dark:ring-blue-600" : ""}`}
        onMouseEnter={() => onHover(item.name)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-6 h-12 md:h-11 cursor-grab active:cursor-grabbing px-1"
          title="Drag to reorder"
        >
          <GripVertical
            size={14}
            className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-60 transition-opacity"
          />
        </div>

        {/* Clickable navigation area */}
        <div
          className="flex items-center cursor-pointer flex-1 justify-between h-12 md:h-11 px-3 md:px-2"
          onClick={(e) => handleClick(e)}
        >
          <div className="flex items-center gap-3 md:gap-2.5">
            <Icon size={20} className="md:w-[18px] md:h-[18px]" />
            <span className="font-medium text-base md:text-sm leading-none">{item.name}</span>
          </div>
          <div className="flex items-center gap-2 h-12 md:h-11">
            {item.badge && item.badge !== "0" && (
              <span
                className={`min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center text-[11px] font-semibold rounded-full text-white leading-none ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-current transition-colors">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children Dropdown */}
      {hasChildren && isOpen && !sidebarCollapsed && (
        <div className="mt-1 ml-6 space-y-1">
          {item.children?.map((child) => (
            <div
              key={child.id}
              onClick={() => onNavigate(child.href)}
              className={`flex items-center h-10 px-3 md:px-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeHref === child.href
                ? "bg-weconnect-red/10 text-weconnect-red font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
              <span className="truncate">{child.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hover tooltip for collapsed sidebar */}
      {sidebarCollapsed && isHovered && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.name}</span>
            {item.badge && item.badge !== "0" && (
              <span className={`min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center text-[11px] font-semibold rounded-full text-white leading-none ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
            <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DraggableNavigationProps {
  navigationItems: NavigationItem[];
  activeHref: string;
  sidebarCollapsed: boolean;
  hoveredItem: string | null;
  onHover: (name: string | null) => void;
  onNavigate: (href: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

const DraggableNavigation: React.FC<DraggableNavigationProps> = ({
  navigationItems,
  activeHref,
  sidebarCollapsed,
  hoveredItem,
  onHover,
  onNavigate,
  setSidebarOpen,
}) => {
  const { menuOrder, setMenuOrder } = useMenu();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort navigation items based on menu order
  const sortedNavigationItems = React.useMemo(() => {
    const itemMap = new Map(navigationItems.map(item => [item.id, item]));
    const ordered: NavigationItem[] = [];

    // Add items in the order specified by menuOrder
    menuOrder.forEach(id => {
      const item = itemMap.get(id);
      if (item) {
        ordered.push(item);
        itemMap.delete(id);
      }
    });

    // Add any remaining items that weren't in menuOrder
    itemMap.forEach(item => {
      ordered.push(item);
    });

    return ordered;
  }, [navigationItems, menuOrder]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedNavigationItems.findIndex(item => item.id === active.id);
      const newIndex = sortedNavigationItems.findIndex(item => item.id === over?.id);

      const newOrder = arrayMove(sortedNavigationItems, oldIndex, newIndex).map(item => item.id);
      setMenuOrder(newOrder);
    }
  }

  const handleNavigate = (href: string) => {
    onNavigate(href);
    setSidebarOpen(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortedNavigationItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 md:space-y-1">
          {sortedNavigationItems.map(item => (
            <SortableItem
              key={item.id}
              id={item.id}
              item={item}
              isActive={activeHref === item.href}
              sidebarCollapsed={sidebarCollapsed}
              hoveredItem={hoveredItem}
              onHover={onHover}
              onNavigate={handleNavigate}
              activeHref={activeHref}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableNavigation;