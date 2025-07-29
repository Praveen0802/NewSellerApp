import { GripVertical } from "lucide-react";
import { useMemo, useState } from "react";

// Enhanced DropdownList with draggable functionality and search
const DropdownList = ({
  isOpen,
  title,
  items = [],
  onItemChange,
  onItemsReorder, // New prop for handling reorder
  emptyMessage = "No items available",
  className = "absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50",
  isDraggable = false, // New prop to enable draggable functionality
  showSearch = false, // New prop to show search bar
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!showSearch || !searchTerm.trim()) return items;

    return items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm, showSearch]);

  if (!isOpen) return null;

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Create new array with reordered items
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    // Remove dragged item
    newItems.splice(draggedIndex, 1);

    // Insert at new position
    newItems.splice(dropIndex, 0, draggedItem);

    // Call parent callback with reordered items
    if (onItemsReorder) {
      onItemsReorder(newItems);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={className}>
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
        {showSearch && (
          <input
            type="text"
            placeholder="Search columns"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filteredItems.map((item, index) => (
          <div
            key={item.key}
            draggable={isDraggable}
            onDragStart={
              isDraggable ? (e) => handleDragStart(e, index) : undefined
            }
            onDragOver={
              isDraggable ? (e) => handleDragOver(e, index) : undefined
            }
            onDragLeave={isDraggable ? handleDragLeave : undefined}
            onDrop={isDraggable ? (e) => handleDrop(e, index) : undefined}
            onDragEnd={isDraggable ? handleDragEnd : undefined}
            className={`
              flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer
              ${isDraggable ? "select-none" : ""}
              ${draggedIndex === index ? "opacity-50" : ""}
              ${
                dragOverIndex === index
                  ? "bg-blue-50 border-l-2 border-blue-500"
                  : ""
              }
            `}
          >
            {/* Drag handle - only show if draggable */}
            {isDraggable && (
              <div className="mr-2 cursor-grab active:cursor-grabbing">
                <span
                  class="min-w-[0.8125rem] max-w-[0.8125rem] flex items-center justify-center fill-gray-400  transition"
                  tabindex="-1"
                  id=""
                  data-tooltip-id=""
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    class=""
                    id=""
                  >
                    <path
                      id="arrow-all"
                      d="M9.321,8h3.3l-.991-.991.938-.938L15.16,8.66l-2.589,2.589-.938-.938.991-.991h-3.3v3.3l.991-.991.938.938L8.66,15.16,6.071,12.571l.938-.938L8,12.623v-3.3H4.7l.991.991-.938.938L2.16,8.66,4.749,6.071l.938.938L4.7,8H8V4.7l-.991.991-.938-.938L8.66,2.16l2.589,2.589-.938.938L9.321,4.7Z"
                      transform="translate(-2.16 -2.16)"
                    ></path>
                  </svg>
                </span>
              </div>
            )}

            {/* Checkbox - positioned based on draggable flag */}
            <input
              type="checkbox"
              checked={item.isActive || item.isVisible}
              onChange={() => onItemChange(item.key)}
              className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                isDraggable ? "order-2 ml-auto" : "mr-2"
              }`}
            />

            {/* Label */}
            <span
              className={`text-sm text-gray-700 ${isDraggable ? "flex-1" : ""}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      {filteredItems.length === 0 && (
        <div className="px-3 py-4 text-sm text-gray-500 text-center">
          {searchTerm ? `No results found for "${searchTerm}"` : emptyMessage}
        </div>
      )}
    </div>
  );
};

export default DropdownList;
