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
      tooltipClass: "bottom-full left-1/2 -translate-x-1/2 mb-1",
      pointerClass: "absolute top-full left-1/2 -translate-x-1/2",
      borderClass: "border-l-4 border-r-4 border-t-4 border-t-gray-800",
    },
    bottom: {
      tooltipClass: "top-full left-1/2 -translate-x-1/2 mt-1",
      pointerClass: "absolute bottom-full left-1/2 -translate-x-1/2",
      borderClass: "border-l-4 border-r-4 border-b-4 border-b-gray-800",
    },
    left: {
      tooltipClass: "right-full top-1/2 -translate-y-1/2 mr-1",
      pointerClass: "absolute top-1/2 left-full -translate-y-1/2",
      borderClass: "border-t-4 border-b-4 border-l-4 border-l-gray-800",
    },
    right: {
      tooltipClass: "left-full top-1/2 -translate-y-1/2 ml-1",
      pointerClass: "absolute top-1/2 right-full -translate-y-1/2",
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
          className={`absolute z-[9999] ${config.tooltipClass} bg-white  text-xs shadow-md px-2 py-1 rounded whitespace-nowrap`}
        >
          {component}
          <div
            className={`${config.pointerClass} w-0 h-0 border-solid border-transparent ${config.borderClass}`}
          ></div>
        </div>
      )}
    </div>
  );
}
