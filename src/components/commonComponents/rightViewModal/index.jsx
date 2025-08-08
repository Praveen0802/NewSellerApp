import { useEffect, useState } from "react";
import CustomModal from "../customModal";

const RightViewModal = ({
  show,
  onClose,
  children,
  className,
  outSideClickClose = false,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimated, setIsAnimated] = useState(false);
  const [modalWidth, setModalWidth] = useState('');

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Small delay to ensure DOM is ready before animation
      const timer = setTimeout(() => {
        setIsAnimated(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsAnimated(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  // Extract width from className if it contains !w-[...] pattern
  useEffect(() => {
    if (className) {
      const widthMatch = className.match(/!w-\[([^\]]+)\]/);
      if (widthMatch) {
        const width = widthMatch[1];
        setModalWidth(width);
      }
    }
  }, [className]);

  if (!isVisible) return null;

  return (
    <CustomModal
      show={isVisible}
      onClose={onClose}
      outSideClickClose={outSideClickClose}
    >
      <div
        className={`
          bg-white 
          h-full 
          fixed 
          top-0 
          right-0 
          shadow-2xl
          overflow-hidden
          transition-all 
          duration-300 
          ease-in-out
          ${isAnimated ? "translate-x-0" : "translate-x-full"}
          ${className || 'w-full sm:w-[500px]'}
        `}
        style={{ 
          isolation: "isolate",
          transform: isAnimated ? "translateX(0)" : "translateX(100%)",
          ...(modalWidth && { 
            width: modalWidth === '100vw' || modalWidth === '100%' ? '100vw' : modalWidth 
          })
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full overflow-auto">
          {children}
        </div>
      </div>
    </CustomModal>
  );
};

export default RightViewModal;