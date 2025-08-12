import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Enhanced Tooltip Component with Portal and Better Positioning
const Tooltip = ({ children, content, position = "top", className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - (tooltipRect?.height || 40) - 8;
        left = triggerRect.left + (triggerRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2);
        left = triggerRect.left - (tooltipRect?.width || 100) - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2);
        left = triggerRect.right + 8;
        break;
      default:
        top = triggerRect.top - (tooltipRect?.height || 40) - 8;
        left = triggerRect.left + (triggerRect.width / 2);
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = tooltipRect?.width || 100;
    const tooltipHeight = tooltipRect?.height || 40;

    // Adjust horizontal position
    if (left - (tooltipWidth / 2) < 8) {
      left = 8 + (tooltipWidth / 2);
    } else if (left + (tooltipWidth / 2) > viewportWidth - 8) {
      left = viewportWidth - 8 - (tooltipWidth / 2);
    }

    // Adjust vertical position
    if (top < 8) {
      top = triggerRect.bottom + 8;
    } else if (top + tooltipHeight > viewportHeight - 8) {
      top = triggerRect.top - tooltipHeight - 8;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      // Recalculate on scroll or resize
      const handleRecalculate = () => calculatePosition();
      window.addEventListener('scroll', handleRecalculate, true);
      window.addEventListener('resize', handleRecalculate);
      
      return () => {
        window.removeEventListener('scroll', handleRecalculate, true);
        window.removeEventListener('resize', handleRecalculate);
      };
    }
  }, [isVisible, position]);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const tooltipContent = isVisible && content ? (
    <div
      ref={tooltipRef}
      className={`fixed z-[9999] pointer-events-none ${className}`}
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="bg-gray-900 text-white text-xs rounded-md py-2 px-3 whitespace-nowrap shadow-lg border border-gray-700">
        {content}
        {/* Arrow */}
        <div 
          className={`absolute w-0 h-0 ${
            position === 'top' 
              ? 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900'
              : position === 'bottom'
              ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900'
              : position === 'left'
              ? 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900'
              : 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900'
          }`}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {typeof window !== 'undefined' && createPortal(
        tooltipContent,
        document.body
      )}
    </>
  );
};

// Alternative simpler solution without portal
const SimpleTooltip = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900",
    right: "right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900"
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      // Add this to ensure tooltip container doesn't get clipped
      style={{ position: 'static' }}
    >
      {children}
      {isVisible && content && (
        <div className={`absolute z-[9999] ${positionClasses[position]}`}>
          <div className="bg-gray-900 text-white text-xs rounded-md py-2 px-3 whitespace-nowrap shadow-lg border border-gray-700">
            {content}
          </div>
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
export { SimpleTooltip };