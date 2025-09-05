import { useMemo, useState } from "react";

// Enhanced DropdownList with draggable functionality and search
const DropdownList = ({
  isOpen,
  title,
  items = [],
  onItemChange,
  onItemsReorder,
  emptyMessage = "No items available",
  className = "absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50",
  isDraggable = false,
  showSearch = false,
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

  // Handle search input - no propagation stopping needed for input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle checkbox change
  const handleCheckboxChange = (itemKey) => {
    onItemChange(itemKey);
  };

  // Handle row click to toggle checkbox
  const handleRowClick = (e, itemKey) => {
    // Only handle if not clicking on checkbox or drag handle
    if (e.target.type === 'checkbox') return;
    if (e.target.closest('.drag-handle')) return;
    
    onItemChange(itemKey);
  };

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
            placeholder="Search items"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filteredItems.map((item, index) => (
          <div
            key={item.key}
            draggable={isDraggable}
            onDragStart={isDraggable ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={isDraggable ? (e) => handleDragOver(e, index) : undefined}
            onDragLeave={isDraggable ? handleDragLeave : undefined}
            onDrop={isDraggable ? (e) => handleDrop(e, index) : undefined}
            onDragEnd={isDraggable ? handleDragEnd : undefined}
            onClick={(e) => handleRowClick(e, item.key)}
            className={`
              flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer
              ${isDraggable ? "select-none" : ""}
              ${draggedIndex === index ? "opacity-50" : ""}
              ${dragOverIndex === index ? "bg-blue-50 border-l-2 border-blue-500" : ""}
            `}
          >
            {/* Drag handle - only show if draggable */}
            {isDraggable && (
              <div className="mr-2 cursor-grab active:cursor-grabbing drag-handle">
                <span className="min-w-[0.8125rem] max-w-[0.8125rem] flex items-center justify-center fill-gray-400 transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                  >
                    <path
                      id="arrow-all"
                      d="M9.321,8h3.3l-.991-.991.938-.938L15.16,8.66l-2.589,2.589-.938-.938.991-.991h-3.3v3.3l.991-.991.938.938L8.66,15.16,6.071,12.571l.938-.938L8,12.623v-3.3H4.7l.991.991-.938.938L2.16,8.66,4.749,6.071l.938.938L4.7,8H8V4.7l-.991.991-.938-.938L8.66,2.16l2.589,2.589-.938.938L9.321,4.7Z"
                      transform="translate(-2.16 -2.16)"
                    />
                  </svg>
                </span>
              </div>
            )}

            {/* Label */}
            <span className={`text-sm text-gray-700 ${isDraggable ? "flex-1" : "flex-1"}`}>
              {item.label}
            </span>

            {/* Checkbox - always on the right */}
            <input
              type="checkbox"
              checked={item.isActive || item.isVisible}
              onChange={() => handleCheckboxChange(item.key)}
              className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-blue-500 ml-2"
              onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
            />
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