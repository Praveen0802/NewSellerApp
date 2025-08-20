import { useEffect, useRef } from "react";

export default function TooltipWrapper({
  children,
  component,
  position = "top",
  tooltipKey,
  activeKey,
  setActiveKey,
}) {
  const tooltipRef = useRef(null);
  const isActive = activeKey === tooltipKey;

  const positionConfigs = {
    top: {
      tooltipClass: "bottom-full right-0 mb-2",
      pointerClass: "absolute top-full right-4",
      borderClass: "border-l-4 border-r-4 border-t-4 border-t-gray-800",
    },
    bottom: {
      tooltipClass: "top-full right-0 mt-2",
      pointerClass: "absolute bottom-full right-4",
      borderClass: "border-l-4 border-r-4 border-b-4 border-b-gray-800",
    },
    left: {
      tooltipClass: "right-full top-0 mr-2",
      pointerClass: "absolute top-4 left-full",
      borderClass: "border-t-4 border-b-4 border-l-4 border-l-gray-800",
    },
    right: {
      tooltipClass: "left-full top-0 ml-2",
      pointerClass: "absolute top-4 right-full",
      borderClass: "border-t-4 border-b-4 border-r-4 border-r-gray-800",
    },
  };

  const config = positionConfigs[position] || positionConfigs.top;

  const handleClick = (e) => {
    e.stopPropagation();
    setActiveKey(isActive ? null : tooltipKey);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setActiveKey(null);
      }
    };

    if (isActive) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isActive]);

  return (
    <div
      ref={tooltipRef}
      className="relative inline-block"
      onClick={handleClick}
    >
      {children}
      {isActive && (
        <div
          className={`absolute ${config.tooltipClass} bg-white text-xs shadow-lg border border-gray-200 px-3 py-2 rounded-lg`}
          style={{ 
            zIndex: 10000,
            width: '280px',
            whiteSpace: 'normal'
          }}
        >
          {component}
          <div
            className={`${config.pointerClass} w-0 h-0 border-solid border-transparent ${config.borderClass}`}
            style={{ zIndex: 10001 }}
          ></div>
        </div>
      )}
    </div>
  );
}