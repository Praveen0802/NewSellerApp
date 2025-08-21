import { useEffect, useRef, useState } from "react";

export default function TooltipWrapper({
  children,
  component,
  position = "top",
  tooltipKey,
  activeKey,
  setActiveKey,
  offset = 8, // pixels between element and tooltip
}) {
  const tooltipRef = useRef(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [isClicked, setIsClicked] = useState(false);
  const isActive = isClicked || activeKey === tooltipKey;

  const updateTooltipPosition = () => {
    if (!tooltipRef.current) return;

    const element = tooltipRef.current.firstChild;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    let style = { position: "fixed", zIndex: 9999 };

    switch (position) {
      case "top":
        style.top = `${rect.top + scrollY - offset}px`;
        style.left = `${rect.left + scrollX + rect.width / 2}px`;
        style.transform = "translateX(-50%) translateY(-100%)";
        break;
      case "bottom":
        style.top = `${rect.bottom + scrollY + offset}px`;
        style.left = `${rect.left + scrollX + rect.width / 2}px`;
        style.transform = "translateX(-50%)";
        break;
      case "left":
        style.top = `${rect.top + scrollY + rect.height / 2}px`;
        style.left = `${rect.left + scrollX - offset}px`;
        style.transform = "translateX(-100%) translateY(-50%)";
        break;
      case "right":
        style.top = `${rect.top + scrollY + rect.height / 2}px`;
        style.left = `${rect.right + scrollX + offset}px`;
        style.transform = "translateY(-50%)";
        break;
      default:
        style.top = `${rect.top + scrollY - offset}px`;
        style.left = `${rect.left + scrollX + rect.width / 2}px`;
        style.transform = "translateX(-50%) translateY(-100%)";
    }

    setTooltipStyle(style);
  };

  const handleMouseEnter = () => {
    if (tooltipKey && !isClicked) {
      setActiveKey(tooltipKey);
      requestAnimationFrame(updateTooltipPosition);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipKey && !isClicked) {
      setActiveKey(null);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (tooltipKey) {
      if (isClicked) {
        setIsClicked(false);
        setActiveKey(null);
      } else {
        setIsClicked(true);
        setActiveKey(tooltipKey);
        requestAnimationFrame(updateTooltipPosition);
      }
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isClicked && tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setIsClicked(false);
        setActiveKey(null);
      }
    };

    if (isClicked) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClicked]);

  // Update position on scroll and resize
  useEffect(() => {
    if (!isActive) return;

    const handleScrollOrResize = () => {
      updateTooltipPosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isActive, position]);

  return (
    <div
      ref={tooltipRef}
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {isActive && (
        <div
          className="bg-white text-gray-800 text-xs shadow-lg px-3 py-1.5 rounded whitespace-nowrap border border-gray-200"
          style={{
            ...tooltipStyle,
            zIndex: 9999,
          }}
        >
          {component}
          {/* Arrow */}
          <div
            className="absolute w-2 h-2 bg-white border-t border-l border-gray-200"
            style={{
              ...(position === "top" && {
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%) rotate(-45deg)",
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                borderTop: 'none',
                borderLeft: 'none',
              }),
              ...(position === "bottom" && {
                top: "-6px",
                left: "50%",
                transform: "translateX(-50%) rotate(135deg)",
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                borderTop: 'none',
                borderLeft: 'none',
              }),
              ...(position === "left" && {
                right: "-6px",
                top: "50%",
                transform: "translateY(-50%) rotate(-135deg)",
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                borderTop: 'none',
                borderLeft: 'none',
              }),
              ...(position === "right" && {
                left: "-6px",
                top: "50%",
                transform: "translateY(-50%) rotate(45deg)",
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                borderTop: 'none',
                borderLeft: 'none',
              }),
            }}
          />
        </div>
      )}
    </div>
  );
}
