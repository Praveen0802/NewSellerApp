import Button from "@/components/commonComponents/button";
import FloatingLabelInput from "@/components/floatinginputFields";
import FloatingLabelTextarea from "@/components/floatinginputFields/floatingTextArea";
import React, { useState } from "react";

const CtaValues = ({ ctaText, order_notes, onSaveNote = () => {} } = {}) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showNoteView, setShowNoteView] = useState(false);
  const [noteValue, setNoteValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNoteAction = (item) => {
    if (item.title === "Order Notes") {
      if (order_notes) {
        // Show existing note
        setShowNoteView(true);
        setShowNoteInput(false);
      } else {
        // Show input to add new note
        setShowNoteInput(true);
        setShowNoteView(false);
        setNoteValue("");
      }
    }
  };

  const handleSaveNote = async () => {
    if (!noteValue.trim()) return;

    setIsLoading(true);
    try {
      if (onSaveNote) {
        await onSaveNote(noteValue.trim());
      }
      setShowNoteInput(false);
      setNoteValue("");
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowNoteInput(false);
    setShowNoteView(false);
    setNoteValue("");
  };

  const handleNoteChange = (e) => {
    setNoteValue(e.target.value);
  };

  const isAddNotes = (item) => {
    if (item?.cta == "+ Add Note") {
      return true;
    }
  };
  return (
    <div className="space-y-4">
      {/* CTA Cards */}
      <div className="flex justify-between gap-4 items-center">
        {ctaText?.map((item, index) => {
          return (
            <div
              key={index}
              className="px-4 flex border border-[#E0E1EA] rounded-lg w-1/2 justify-between items-center py-3 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <p className="text-base flex gap-2 items-center font-semibold text-[#343432]">
                {item?.title}
              </p>
              <Button
                onClick={() => {
                  if (item?.onClick) {
                    item?.onClick(item);
                  } else {
                    handleNoteAction(item);
                  }
                }}
                classNames={{
                  root: `${"bg-[#343432] text-white"} px-3 py-2 transition-colors duration-200`,
                  label_: "text-xs text-white font-medium",
                }}
                // loading={item?.loading}
                disabled={item.cta === "No File"}
              >
                
                {item?.icon && item?.icon}
                {item?.cta}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Note View Modal */}
      {showNoteView && order_notes && (
        <div className="bg-white border border-[#E0E1EA] rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-[#343432]">
              Order Notes
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              aria-label="Close"
              title="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
            <p className="text-sm text-[#343432] leading-relaxed whitespace-pre-wrap">
              {order_notes}
            </p>
          </div>
        </div>
      )}

      {/* Add Note Input */}
      {showNoteInput && (
        <div className="bg-white border border-[#E0E1EA] rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#343432]">
              Add Order Note
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
              aria-label="Close"
              title="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <FloatingLabelTextarea
              id="order-note-input"
              label="Enter your note"
              type="text"
              value={noteValue}
              onChange={handleNoteChange}
              placeholder="Type your note here..."
              className="min-h-[100px] resize-none"
              autoFocus={true}
              required={isLoading}
            />

            <div className="flex justify-end gap-3">
              <Button
                onClick={handleCancel}
                classNames={{
                  root: "bg-gray-100 hover:bg-gray-200 px-4 py-2 border border-gray-300 transition-colors duration-200",
                  label_: "text-sm text-gray-700 font-medium",
                }}
                label="Cancel"
                disabled={isLoading}
              />

              <Button
                onClick={handleSaveNote}
                classNames={{
                  root: `${
                    noteValue.trim()
                      ? "bg-[#343432] hover:bg-[#0129B8]"
                      : "bg-gray-400 cursor-not-allowed"
                  } px-4 py-2 transition-colors duration-200`,
                  label_: "text-sm text-white font-medium",
                }}
                label={isLoading ? "Saving..." : "Save Note"}
                disabled={!noteValue.trim() || isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CtaValues;
