import React, { useState } from "react";
import {
  Check,
  X,
  Copy,
  Edit,
  Trash2,
  ChevronUp,
  Loader2,
  SquareX,
  Save,
  Users,
} from "lucide-react";

const BulkActionBar = ({
  selectedCount = 3,
  totalCount = 150,
  onSelectAll,
  onDeselectAll,
  onClone,
  onEdit,
  onDelete,
  onPublishLive,
  onSaveEdit,
  onCancelEdit,
  loading = false,
  disabled = false,
  isEditMode = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`fixed bottom-0 left-10 right-0 border-t border-gray-200 shadow-lg z-50 ${
      disabled ? 'bg-gray-100 pointer-events-none' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between px-10 py-2">
        {/* Left side - Action buttons */}
        <div className="flex items-center gap-6">
          {!isEditMode ? (
            <>
              {/* Normal mode buttons */}
              {/* Select All Button */}
              <button
                onClick={onSelectAll}
                disabled={disabled || selectedCount === totalCount}
                className={`flex px-2 py-1 cursor-pointer items-center space-x-2 text-[13px] rounded-md transition-colors ${
                  disabled || selectedCount === totalCount
                    ? "text-gray-400 cursor-not-allowed bg-gray-200"
                    : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                }`}
              >
                <Check className={disabled ? "text-gray-400" : "text-[#0137D5]"} size={16} />
                <span className={`text-[14px] ${disabled ? "text-gray-400" : "text-[#323A70]"}`}>Select all</span>
              </button>

              {/* Deselect All Button */}
              <button
                onClick={onDeselectAll}
                disabled={disabled}
                className={`flex items-center bg-[#F0F1F5] cursor-pointer px-2 py-1 space-x-2 text-[13px] rounded-md transition-colors ${
                  disabled
                    ? "text-gray-400 cursor-not-allowed bg-gray-200"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <SquareX className={disabled ? "text-gray-400" : "text-[#0137D5]"} size={16} />
                <span className={`text-[14px] ${disabled ? "text-gray-400" : "text-[#323A70]"}`}>Deselect all</span>
              </button>

              {/* Clone Button */}
              <button
                onClick={onClone}
                disabled={disabled}
                className={`flex items-center bg-[#F0F1F5] cursor-pointer px-2 py-1 space-x-2 text-[13px] rounded-md transition-colors ${
                  disabled
                    ? "text-gray-400 cursor-not-allowed bg-gray-200"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Copy className={disabled ? "text-gray-400" : "text-[#0137D5]"} size={16} />
                <span className={`text-[14px] ${disabled ? "text-gray-400" : "text-[#323A70]"}`}>Clone</span>
              </button>

              {/* Edit Button */}
              <button
                onClick={onEdit}
                disabled={disabled}
                className={`flex items-center space-x-2 bg-[#F0F1F5] cursor-pointer px-2 py-1 text-[13px] rounded-md transition-colors ${
                  disabled
                    ? "text-gray-400 cursor-not-allowed bg-gray-200"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Edit className={disabled ? "text-gray-400" : "text-[#0137D5]"} size={16} />
                <span className={`text-[14px] ${disabled ? "text-gray-400" : "text-[#323A70]"}`}>
                  {selectedCount > 1 ? "Bulk Edit" : "Edit"}
                </span>
              </button>

              {/* Delete Button */}
              <button
                onClick={onDelete}
                disabled={disabled}
                className={`flex items-center space-x-2 bg-[#F0F1F5] cursor-pointer px-2 py-1 text-[13px] rounded-md transition-colors ${
                  disabled
                    ? "text-gray-400 cursor-not-allowed bg-gray-200"
                    : "hover:bg-red-50"
                }`}
              >
                <Trash2 className={disabled ? "text-gray-400" : "text-[#0137D5]"} size={16} />
                <span className={`text-[14px] ${disabled ? "text-gray-400" : "text-[#323A70]"}`}>Delete</span>
              </button>
            </>
          ) : (
            <>
              {/* Edit mode buttons */}
              <div className="flex items-center space-x-2 text-sm font-medium bg-blue-50 px-3 py-1 rounded-md">
                {selectedCount > 1 ? (
                  <>
                    <Users size={16} className="text-blue-600" />
                    <span className="text-blue-600">Bulk Edit Mode Active</span>
                    <span className="text-blue-500 text-xs">({selectedCount} rows)</span>
                  </>
                ) : (
                  <>
                    <Edit size={16} className="text-blue-600" />
                    <span className="text-blue-600">Edit Mode Active</span>
                  </>
                )}
              </div>
              
              {/* Bulk edit info */}
              {selectedCount > 1 && (
                <div className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <span className="font-medium">💡 Tip:</span> Changes to any field will apply to all selected rows
                </div>
              )}
              
              {/* Save Button */}
              <button
                onClick={onSaveEdit}
                className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 text-[13px] rounded-md transition-colors hover:bg-green-700"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>

              {/* Cancel Button */}
              <button
                onClick={onCancelEdit}
                className="flex items-center space-x-2 bg-gray-500 text-white px-3 py-1 text-[13px] rounded-md transition-colors hover:bg-gray-600"
              >
                <X size={16} />
                <span>Cancel Edit</span>
              </button>
            </>
          )}
        </div>

        {/* Right side - Selection info and actions */}
        <div className="flex items-center space-x-4">
          {!isEditMode ? (
            <>
              {/* Normal mode right side */}
              {/* Selection count info */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedCount}</span> of {totalCount} selected
              </div>

              {/* Cancel Button */}
              <button
                onClick={onDeselectAll}
                disabled={disabled}
                className={`px-4 py-2 text-sm border rounded-md transition-colors font-medium ${
                  disabled
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>

              {/* Publish Live Button */}
              <button
                onClick={onPublishLive}
                disabled={disabled || loading}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  disabled || loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>PUBLISHING...</span>
                  </div>
                ) : (
                  `PUBLISH LIVE ${selectedCount > 0 ? `(${selectedCount})` : ''}`
                )}
              </button>
            </>
          ) : (
            <>
              {/* Edit mode right side */}
              <div className="text-sm text-gray-600">
                Editing {selectedCount} row{selectedCount !== 1 ? 's' : ''} of {totalCount}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;