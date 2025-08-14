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
  Upload,
} from "lucide-react";
import { useSelector } from "react-redux";

const BulkActionBar = ({
  selectedCount = 0,
  totalCount = 0,
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
  hidepublishLive = false,
  // NEW: Clone functionality props (optional for backward compatibility)
  onPublishCloned,
  hasClonedTickets = false,
  selectedClonedCount = 0,
  areAllSelectedCloned = false,
  hasAnyClonedSelected = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { showFullDisplay } = useSelector((state) => state.common);

  // Updated logic: Determine if all items are selected
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  // Select All button should be:
  // - Enabled when there are items (totalCount > 0) AND not all are selected
  // - Disabled when all items are already selected OR no items exist
  const selectAllDisabled = totalCount === 0 || allSelected;

  // NEW: Determine selection status and available actions
  const getSelectionStatusText = () => {
    if (areAllSelectedCloned) {
      return `${selectedClonedCount} cloned ticket${
        selectedClonedCount > 1 ? "s" : ""
      } selected`;
    } else if (hasAnyClonedSelected) {
      return `${selectedCount} ticket${
        selectedCount > 1 ? "s" : ""
      } selected (${selectedClonedCount} cloned)`;
    } else {
      return `${selectedCount} of ${totalCount} selected`;
    }
  };

  // NEW: Determine if clone actions should be disabled
  const cloneActionsDisabled = hasAnyClonedSelected && !areAllSelectedCloned;
  const editDisabled = disabled || selectedCount === 0 || hasAnyClonedSelected;
console.log(disabled || loading || selectedClonedCount === 0,loading,selectedClonedCount,'disabled || loading || selectedClonedCount === 0',disabled,)
  return (
    <div
      className={`fixed bottom-0 ${
        showFullDisplay ? "left-40" : "left-10"
      } right-0 border-t border-gray-200 shadow-lg z-50 ${
        disabled ? "bg-gray-100 " : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between px-10 py-2">
        {/* Left side - Action buttons */}
        <div className="flex items-center gap-6">
          {!isEditMode ? (
            <>
              {/* Normal mode buttons */}
              {/* Select All Button with Checkbox */}
              <button
                onClick={onSelectAll}
                disabled={selectAllDisabled}
                className={`flex px-2 py-1 cursor-pointer items-center space-x-2 text-[13px] rounded-md transition-colors ${
                  selectAllDisabled
                    ? "text-gray-400 cursor-not-allowed bg-gray-200"
                    : "text-gray-600 hover:text-blue-800 hover:bg-blue-50"
                }`}
              >
                {/* Checkbox instead of Check icon */}
                <div
                  className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    allSelected
                      ? "bg-[#343432] border-[#0137D5]"
                      : selectAllDisabled
                      ? "border-gray-300 bg-gray-100"
                      : "border-[#DADBE5] bg-white hover:bg-blue-50"
                  }`}
                >
                  {allSelected && <Check size={12} className="text-white" />}
                </div>
                <span
                  className={`text-[14px] ${
                    selectAllDisabled ? "text-gray-400" : "text-[#323A70]"
                  }`}
                >
                  Select all
                </span>
              </button>

              {/* Deselect All Button */}
              <button
                onClick={onDeselectAll}
                disabled={disabled || selectedCount === 0}
                className={`flex items-center bg-[#F0F1F5] cursor-pointer px-2 py-1 space-x-2 text-[13px] rounded-md transition-colors ${
                  disabled || selectedCount === 0
                    ? "text-gray-400 cursor-not-allowed bg-gray-200"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <SquareX
                  className={
                    disabled || selectedCount === 0
                      ? "text-gray-400"
                      : "text-[#343432]"
                  }
                  size={16}
                />
                <span
                  className={`text-[14px] ${
                    disabled || selectedCount === 0
                      ? "text-gray-400"
                      : "text-[#323A70]"
                  }`}
                >
                  Deselect all
                </span>
              </button>

              {/* Clone Button - Show warning tooltip if cloned tickets are selected */}
              <div className="relative group">
                <button
                  onClick={onClone}
                  disabled={
                    disabled || selectedCount === 0 || areAllSelectedCloned
                  }
                  className={`flex items-center bg-[#F0F1F5] cursor-pointer px-2 py-1 space-x-2 text-[13px] rounded-md transition-colors ${
                    disabled || selectedCount === 0 || areAllSelectedCloned
                      ? "text-gray-400 cursor-not-allowed bg-gray-200"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Copy
                    className={
                      disabled || selectedCount === 0 || areAllSelectedCloned
                        ? "text-gray-400"
                        : "text-[#343432]"
                    }
                    size={16}
                  />
                  <span
                    className={`text-[14px] ${
                      disabled || selectedCount === 0 || areAllSelectedCloned
                        ? "text-gray-400"
                        : "text-[#323A70]"
                    }`}
                  >
                    Clone
                  </span>
                </button>
                {/* Tooltip for disabled clone */}
                {areAllSelectedCloned && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Cannot clone already cloned tickets
                  </div>
                )}
              </div>

              {/* Edit Button - Disabled if any cloned tickets are selected */}
              <div className="relative group">
                <button
                  onClick={onEdit}
                  disabled={editDisabled}
                  className={`flex items-center space-x-2 bg-[#F0F1F5] cursor-pointer px-2 py-1 text-[13px] rounded-md transition-colors ${
                    editDisabled
                      ? "text-gray-400 cursor-not-allowed bg-gray-200"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Edit
                    className={
                      editDisabled ? "text-gray-400" : "text-[#343432]"
                    }
                    size={16}
                  />
                  <span
                    className={`text-[14px] ${
                      editDisabled ? "text-gray-400" : "text-[#323A70]"
                    }`}
                  >
                    {selectedCount > 1 ? "Bulk Edit" : "Edit"}
                  </span>
                </button>
                {/* Tooltip for disabled edit */}
                {hasAnyClonedSelected && !areAllSelectedCloned && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Cannot edit cloned tickets
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={onDelete}
                disabled={disabled || selectedCount === 0}
                className={`flex items-center space-x-2 bg-[#F0F1F5] cursor-pointer px-2 py-1 text-[13px] rounded-md transition-colors ${
                  disabled || selectedCount === 0
                    ? "text-gray-400 cursor-not-allowed bg-gray-200"
                    : "hover:bg-red-50"
                }`}
              >
                <Trash2
                  className={
                    disabled || selectedCount === 0
                      ? "text-gray-400"
                      : "text-[#343432]"
                  }
                  size={16}
                />
                <span
                  className={`text-[14px] ${
                    disabled || selectedCount === 0
                      ? "text-gray-400"
                      : "text-[#323A70]"
                  }`}
                >
                  Delete
                </span>
              </button>

              {/* NEW: Publish Cloned Button - Only show when all selected are cloned */}
              {areAllSelectedCloned && onPublishCloned && (
                <button
                  onClick={onPublishCloned}
                  disabled={disabled || loading || selectedClonedCount === 0}
                  className={`flex items-center space-x-2 px-3 py-1 text-[13px] rounded-md transition-colors font-medium ${
                    disabled || loading || selectedClonedCount === 0
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Publish Cloned ({selectedClonedCount})</span>
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <>
              {/* Edit mode buttons */}
              <div className="flex items-center space-x-2 text-sm font-medium bg-blue-50 px-3 py-1 rounded-md">
                {selectedCount > 1 ? (
                  <>
                    <Users size={16} className="text-gray-600" />
                    <span className="text-gray-600">Bulk Edit Mode Active</span>
                    <span className="text-blue-500 text-xs">
                      ({selectedCount} rows)
                    </span>
                  </>
                ) : (
                  <>
                    <Edit size={16} className="text-gray-600" />
                    <span className="text-gray-600">Edit Mode Active</span>
                  </>
                )}
              </div>

              {/* Bulk edit info */}
              {selectedCount > 1 && (
                <div className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <span className="font-medium">💡 Tip:</span> Changes to any
                  field will apply to all selected rows
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
              {/* Selection count info with clone status */}
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {getSelectionStatusText()}
                  </span>
                </div>

                {/* NEW: Clone status indicators */}
                {hasAnyClonedSelected && !areAllSelectedCloned && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    Mixed selection
                  </span>
                )}
                {areAllSelectedCloned && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Cloned tickets
                  </span>
                )}
              </div>

              {!hidepublishLive && !areAllSelectedCloned && (
                <>
                  {/* Cancel Button */}
                  <button
                    onClick={onDeselectAll}
                    disabled={disabled || selectedCount === 0}
                    className={`px-4 py-2 text-sm border rounded-md transition-colors font-medium ${
                      disabled || selectedCount === 0
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>

                  {/* Publish Live Button - Hidden when cloned tickets are selected */}
                  {!hasAnyClonedSelected && (
                    <button
                      onClick={onPublishLive}
                      disabled={disabled || loading || selectedCount === 0}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                        disabled || loading || selectedCount === 0
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
                        `PUBLISH LIVE ${
                          selectedCount > 0 ? `(${selectedCount})` : ""
                        }`
                      )}
                    </button>
                  )}
                </>
              )}

              {/* NEW: Cancel button for cloned selection */}
              {areAllSelectedCloned && (
                <button
                  onClick={onDeselectAll}
                  disabled={disabled || selectedCount === 0}
                  className={`px-4 py-2 text-sm border rounded-md transition-colors font-medium ${
                    disabled || selectedCount === 0
                      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
              )}
            </>
          ) : (
            <>
              {/* Edit mode right side */}
              <div className="text-sm text-gray-600">
                Editing {selectedCount} row{selectedCount !== 1 ? "s" : ""} of{" "}
                {totalCount}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
