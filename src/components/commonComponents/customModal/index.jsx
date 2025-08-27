import { useEffect, useRef } from "react";

const CustomModal = (props) => {
  const { children, show, onClose, outSideClickClose } = props;
  const ref = useRef(null);
  useEffect(() => {
    if (outSideClickClose) {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          onClose && onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 overflow-y-auto bg-black/30 z-[99]`}>
      <div className="flex items-center justify-center min-h-[100vh] p-2 xs:p-4 sm:p-6">
        <div ref={ref} className={`w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-none ${props.className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
