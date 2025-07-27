const FloatingPlaceholder = (props) => {
  const { isFocused, variation, className, hasError } = props;

  return (
    <div
      className={`absolute pointer-events-none ${className} transition-all duration-[0.1s] ease-linear z-10 ${
        isFocused || hasError
          ? "top-0 left-3 text-[12px] px-1 transform -translate-y-1/2"
          : "text-[16px] top-1/2 left-4 transform -translate-y-1/2"
      } ${
        hasError
          ? "text-red-500"
          : isFocused
          ? "text-[#022B50]"
          : "text-[#606162]"
      } bg-white`}
    >
      {props.children}
    </div>
  );
};

export default FloatingPlaceholder;
