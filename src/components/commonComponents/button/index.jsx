import { twMerge } from "tailwind-merge";
import Spinner from "../spinner";

const Button = (props) => {
  const {
    label,
    uploadbtn,
    onClick = () => {},
    iconBefore,
    iconAfter,
    type,
    disabled = false,
    classNames = {},
    loading = false,
    submitButton,
    tracking = {},
    customLogo = {},
    children,
    ...rest
  } = props;

  /* Getting styles for all */
  const { root = "", label_ = "" } = classNames;
  // const getIcon = (image, className) => <div className={className}><Logo {...image} /></div>;

  /* Style mapping for (primary, primary-disable, secondary, secondary-disable) Button */

  const classNameMapping = {
    primary: "bg-[#343432] text-white py-[10px] xs:py-[12.5px] text-white",
    "primary-disable":
      "bg-[#E6EAEE] border-[1px] border-[#E6EAEE] text-[#CCD5DC]",
    blueType: "bg-[#343432] text-white",
    secondary: "bg-none border-[1px] border-[#022B50] text-[#022B50]",
    "secondary-disable": "bg-none border-[1px] border-[#8095A7] text-[#8095A7]",
  };

  const { eventName, screen, custom } = tracking;

  const rootStyle = twMerge(
    `font-medium text-[13px] xs:text-[14px] rounded-[4px] flex items-center gap-[4px] xs:gap-[5px] bg-[none] p-[6px] xs:p-[7px] px-[8px] xs:px-[10px] relative overflow-hidden min-h-[36px] xs:min-h-[40px]`,
    classNameMapping[type] || "border-[#E6EAEE] border-[1px]",
    root,
    tracking ? "event-track" : "",
    disabled
      ? `!cursor-not-allowed ${classNameMapping[`${type}-disable`]}`
      : "cursor-pointer hover:bg-opacity-90 active:bg-opacity-95 transition-colors"
  );

  return (
    <button
      className={rootStyle}
      type={submitButton ? "submit" : "button"}
      onClick={(e) => (!disabled && !loading ? onClick(e) : undefined)}
      data-track={JSON.stringify({ name: eventName, screen, custom })}
      {...rest}
    >
      {iconBefore && iconBefore}

      {!loading ? (
        <p className={twMerge(`text-left`, label_)}>{label}</p>
      ) : (
        <Spinner />
      )}
      {iconAfter && iconAfter}
      {children}
    </button>
  );
};

export default Button;
