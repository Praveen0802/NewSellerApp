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
      <div className="flex items-center justify-center min-h-[100vh]">
        <div ref={ref} className={props.className}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
