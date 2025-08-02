const DownloadIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M8.00016 9.97949V2.06283M8.00016 9.97949C7.44584 9.97949 6.41012 8.40067 6.021 8.00033M8.00016 9.97949C8.55449 9.97949 9.59023 8.40067 9.97933 8.00033"
      stroke="#0137D5"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M14.3334 11.5625C14.3334 13.5274 13.9233 13.9375 11.9584 13.9375H4.04175C2.07683 13.9375 1.66675 13.5274 1.66675 11.5625"
      stroke="#0137D5"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const DownloadButton = ({
  label = "Download Report",
  disabled = false,
  onClick = () => {},
  loader = false,
  loaderText = "Downloading",
  className = "",
}) => {
  return (
    <>
      <div
        className={`bg-[#F0F1F5] p-[8px] flex  justify-center items-center gap-[4px] w-fit rounded-[4px] hover:bg-[#D1D5DB] hover:font-semibold
${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
        onClick={!disabled ? onClick : null}
      >
        {loader ? (
          <span className="animate-spin h-4 w-4 border-2 border-[#0137D5] border-t-transparent rounded-full"></span>
        ) : (
          DownloadIcon
        )}
        <span className="text-[#323A70] text-[14px] leading-[16px]">
          {loader ? loaderText : label}
        </span>
      </div>
    </>
  );
};
export default DownloadButton;
