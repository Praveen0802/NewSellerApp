import RightViewModal from "../commonComponents/rightViewModal";

const NotificationPopup = ({ item, onClose, isVisible } = {}) => {
  if (!isVisible || !item) return null;

  const isActivity = item.type === "logged_in" || item.type === "logged_out";

  return (
    <RightViewModal show={isVisible} onClose={onClose}>
      <div className="bg-white h-full shadow-xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
          aria-label="Close"
        >
          ×
        </button>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
              {item.status === "new"
                ? "New"
                : isActivity
                ? "Activity"
                : "Notification"}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 pr-8">
            {item.date}
          </h3>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-800 leading-relaxed mb-4">
            {item.title}
          </p>

          {/* {item.type === "seller_notification" && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 space-y-1">
                {item.artist && (
                  <div>
                    <strong>Event:</strong> {item.artist}
                  </div>
                )}
                {item.venue && (
                  <div>
                    <strong>Venue:</strong> {item.venue}
                  </div>
                )}
                {item.ticketCount && (
                  <div>
                    <strong>Tickets:</strong> {item.ticketCount}
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* {isActivity && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 space-y-1">
                {item.userName && (
                  <div>
                    <strong>User:</strong> {item.userName}
                  </div>
                )}
                {item.userId && (
                  <div>
                    <strong>User ID:</strong> {item.userId}
                  </div>
                )}
                <div>
                  <strong>Activity:</strong> {item.type.replace("_", " ")}
                </div>
              </div>
            </div>
          )} */}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </RightViewModal>
  );
};

export default NotificationPopup;
