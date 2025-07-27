import React from "react";

const StickySelectionBar = ({ 
  selectedCount, 
  onRequestEvent, 
  onDelete, 
  onCancel, 
  onAddTickets,
  selectedEvents = []
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DADBE5] shadow-lg z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Selection info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-[#323A70] font-medium">
            {selectedCount} Event{selectedCount > 1 ? 's' : ''} Selected
          </div>
          
          {/* Selected team info if available */}
          {selectedEvents.length > 0 && selectedEvents[0].team_1 && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Team {selectedEvents[0].team_1}
            </div>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-3">
          {/* Request Event Button */}
          <button
            onClick={onRequestEvent}
            className="bg-[#28A745] hover:bg-[#218838] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Request Event
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="bg-[#DC3545] hover:bg-[#C82333] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Delete
          </button>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          {/* Add Tickets Button */}
          <button
            onClick={onAddTickets}
            className="bg-[#007BFF] hover:bg-[#0056B3] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Add Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickySelectionBar;