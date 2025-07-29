import React, { useState } from "react";
import { X } from "lucide-react";

// Custom styles for classes not available in core Tailwind
const customStyles = `
  .text-sm15 { font-size: 0.9375rem; }
  .text-sm13 { font-size: 0.8125rem; }
  .text-sm12 { font-size: 0.75rem; }
  .text-sm11 { font-size: 0.6875rem; }
  .text-xxs { font-size: 0.625rem; }
  .bg-sky-blue-500 { background-color: #0ea5e9; }
  .fill-green-600 { fill: #059669; }
  .fill-gray-400 { fill: #9ca3af; }
  .fill-gray-500 { fill: #6b7280; }
  .fill-white { fill: #ffffff; }
`;

const TicketListingQuality = ({ onClose = () => {} } = {}) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [hasTicketsInHand, setHasTicketsInHand] = useState(true);
  const [hasUploadedTickets, setHasUploadedTickets] = useState(true);
  const [priceCategory, setPriceCategory] = useState("green");

  const levels = [
    {
      id: 1,
      title: "Level 1",
      description: "All required fields:",
      requirement: "Section/block",
      detail: "▪ Same as Category where block-specific options available",
      examples: [{ category: "Longside Lower", section: "Longside Lower" }],
    },
    {
      id: 2,
      title: "Level 2",
      description: "All required fields:",
      requirement: "Section/block",
      detail: "▪ Different to Category where block-specific options available",
      examples: [
        { category: "Longside Lower", section: "Block 111" },
        { category: "Floor Standing", section: "Floor Standing" },
      ],
    },
    {
      id: 3,
      title: "Level 3",
      description: "All Level 2 requirements plus:",
      requirement: "Tickets in hand",
      detail:
        "In-hand tickets must be delivered within 24 hours of a confirmed sale - failure to meet this deadline can result in cancellation and a penalty on your account.",
      interactive: true,
    },
    {
      id: 4,
      title: "Level 4",
      description: "All required fields plus:",
      requirement: "Upload tickets",
      detail:
        "Make tickets available for immediate download to reach maximum Listing Quality.",
      interactive: true,
    },
  ];

  const priceCategories = [
    {
      color: "green",
      bg: "bg-green-600",
      text: "Green - Competitively priced and likely to sell",
    },
    {
      color: "orange",
      bg: "bg-orange-500",
      text: "Orange - More likely to sell at a lower price",
    },
    {
      color: "red",
      bg: "bg-rose-500",
      text: "Red - Not likely to sell at this price",
    },
    { color: "blue", bg: "bg-sky-blue-500", text: "Blue - Price too low" },
  ];

  const renderProgressBar = (activeLevel) => {
    return (
      <div className="info_block gap-x-0.5 flex flex-nowrap border border-gray-400 rounded p-[0.1875rem] bg-white ml-5">
        <span className="rounded-l-sm bg-violet-500 text-white w-[4.125rem] p-[0.1875rem]"></span>
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`w-[0.9375rem] p-[0.1875rem] ${
              level <= activeLevel ? "bg-green-600" : "bg-gray-300"
            } ${level === 4 ? "rounded-r-sm" : ""}`}
          ></span>
        ))}
      </div>
    );
  };

  const renderMainProgressBar = () => {
    return (
      <div className="info_block gap-x-1.5 flex flex-nowrap border border-gray-400 rounded-lg p-1.5 bg-white text-center text-white md:text-sm13 text-sm11 mb-5">
        <span className="rounded-l bg-violet-500 text-white w-full md:min-w-[50%] min-w-[23%] p-0.5">
          Low
        </span>
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`w-full p-0.5 ${
              level <= currentLevel ? "bg-green-600" : "bg-gray-300"
            } ${level === 4 ? "rounded-r" : ""}`}
          >
            Level {level}
          </span>
        ))}
      </div>
    );
  };

  const renderInputField = (label, value, disabled = false) => {
    return (
      <div className="dd_block input_block px-2.5 sm:w-1/2 w-full max-sm:mb-4">
        <div
          className={`input_inner bg-white border rounded relative text-sm12 p-1 min-h-[1.875rem] pl-2.5 leading-4 flex items-center ${
            disabled ? "text-gray-400" : "text-violet-800"
          }`}
        >
          <label className="absolute top-0 left-2 -translate-y-1/2 bg-white px-[0.1875rem] text-gray-400 text-xxs">
            {label}
          </label>
          {value}
        </div>
      </div>
    );
  };

  const renderTicketsInHandField = () => {
    return (
      <div className="input_block px-2.5 sm:w-1/2 w-full">
        <div
          className={`input_inner bg-white border rounded relative text-sm12 p-1 min-h-[1.875rem] pl-[2.375rem] leading-4 flex items-center overflow-hidden justify-between cursor-pointer ${
            hasTicketsInHand
              ? "border-green-600 text-green-600"
              : "border-gray-300 text-gray-500"
          }`}
          //   onClick={() => setHasTicketsInHand(!hasTicketsInHand)}
        >
          <div
            className={`icon_block bg-white absolute left-0 top-0 w-[1.875rem] h-full flex items-center justify-center border-r ${
              hasTicketsInHand ? "border-green-600" : "border-gray-300"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11.178"
              height="14.5"
              viewBox="0 0 11.178 14.5"
              className={`w-[0.6875rem] h-3.5 ${
                hasTicketsInHand ? "fill-green-600" : "fill-gray-400"
              }`}
            >
              <path
                d="M8.843,14.5a4.816,4.816,0,0,1-4.471-3.033l-1.831-4.6a.6.6,0,0,1,.749-.8l.477.157a1.212,1.212,0,0,1,.749.7l.852,2.133h.453v-7.1a.755.755,0,0,1,1.51,0V7.25h.6V.755a.755.755,0,1,1,1.51,0V7.25h.6V1.661a.755.755,0,0,1,1.51,0V7.25h.6V3.474a.755.755,0,0,1,1.51,0V9.667A4.832,4.832,0,0,1,8.843,14.5Z"
                transform="translate(-2.498)"
              />
            </svg>
          </div>
          Tickets in hand
          <div
            className={`checkbox w-[0.8125rem] h-[0.8125rem] flex items-center justify-center rounded-sm mr-1 ${
              hasTicketsInHand ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {hasTicketsInHand && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12.136"
                height="10.324"
                viewBox="0 0 12.136 10.324"
                className="fill-white w-[0.4375rem]"
              >
                <path
                  d="M34.471,428.766l-4.04-4.713,1.139-.976,2.907,3.392,6.956-8.027,1.134.982Z"
                  transform="translate(-30.431 -418.442)"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUploadTicketsField = () => {
    return (
      <div className="input_block px-2.5 sm:w-1/2 w-full">
        <div
          className={`input_inner bg-white border rounded relative text-sm12 p-1 min-h-[1.875rem] pl-[2.375rem] leading-4 flex items-center overflow-hidden justify-between  ${
            hasUploadedTickets
              ? "border-green-600 text-green-600"
              : "border-gray-300 text-gray-500"
          }`}
          //   onClick={() => setHasUploadedTickets(!hasUploadedTickets)}
        >
          <div
            className={`icon_block bg-white absolute left-0 top-0 w-[1.875rem] h-full flex items-center justify-center border-r ${
              hasUploadedTickets ? "border-green-600" : "border-gray-300"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 13 11.001"
              className={`w-[0.8125rem] ${
                hasUploadedTickets ? "fill-green-600" : "fill-gray-400"
              }`}
            >
              <path d="M5.75,11H1a1,1,0,0,1-1-1V1A1,1,0,0,1,1,0H12a1,1,0,0,1,1,1v9a1,1,0,0,1-1,1H7.25V6.5H9.875L6.5,2,3.125,6.5H5.75V11Z" />
            </svg>
          </div>
          {hasUploadedTickets ? "Tickets uploaded" : "Upload tickets"}
          <div
            className={`checkbox w-[0.8125rem] h-[0.8125rem] flex items-center justify-center rounded-sm mr-1 ${
              hasUploadedTickets ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {hasUploadedTickets ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12.136"
                height="10.324"
                viewBox="0 0 12.136 10.324"
                className="fill-white w-[0.4375rem]"
              >
                <path
                  d="M34.471,428.766l-4.04-4.713,1.139-.976,2.907,3.392,6.956-8.027,1.134.982Z"
                  transform="translate(-30.431 -418.442)"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="9.546"
                height="9.546"
                viewBox="0 0 9.546 9.546"
                className="fill-gray-500 w-2 h-2"
              >
                <g transform="translate(-1081.227 -498.227)">
                  <g transform="translate(-548 158)">
                    <rect
                      width="12"
                      height="1.5"
                      transform="translate(1630.288 340.227) rotate(45)"
                    />
                    <rect
                      width="12"
                      height="1.5"
                      transform="translate(1638.773 341.288) rotate(135)"
                    />
                  </g>
                </g>
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Calculate current level based on interactions
  React.useEffect(() => {
    let level = 2; // Base level
    if (hasTicketsInHand) level = 3;
    if (hasUploadedTickets) level = 4;
    setCurrentLevel(level);
  }, [hasTicketsInHand, hasUploadedTickets]);

  return (
    <>
      <style>{customStyles}</style>

      <div className="flex items-center justify-between p-2 sticky top-0 bg-white z-999999 border-b-[1px] border-gray-200 ">
        <p className="text-[16px] font-semibold">Listing Quality</p>
        <div
          className="cursor-pointer"
          onClick={() => onClose()}
          title={"Close"}
        >
          <X />
        </div>
      </div>

      <div className="meter_info  rounded-xl p-2">
        <h2 className="text-sm15 font-medium leading-5 mb-5">How it works</h2>

        {renderMainProgressBar()}

        <div className="require_field text-sm13 md:p-5 p-3.5 md:pt-4 bg-gray-100/50 rounded-lg">
          <h2 className="text-sm15 font-semibold leading-5 mb-3.5">
            Required fields
          </h2>
          <p className="font-semibold mb-1.5">
            Ticket type + Quantity + Category + Section/block + Face value +
            Proceed price
          </p>
          <p>
            Listing Quality will increase as you complete the fields required to
            list on the Tixstock Network.
          </p>
        </div>

        <div className="levels_info mt-5">
          {levels.map((level, index) => (
            <div
              key={level.id}
              className={`single-level bg-gray-100/50 rounded-lg md:p-5 p-3.5 md:pt-4 ${
                index > 0 ? "mt-5" : ""
              }`}
            >
              <div className="title-level flex flex-wrap items-center mb-3">
                <h2 className="leading-5 text-sm15 font-semibold">
                  {level.title}
                </h2>
                {renderProgressBar(level.id)}
              </div>

              <div className="level_content text-sm13">
                <p className="mb-3">{level.description}</p>
                <p className="font-semibold mb-3">{level.requirement}</p>

                {level.id === 1 && (
                  <>
                    <p className="mb-4">{level.detail}</p>
                    <div className="blocks -mx-2.5 flex flex-wrap">
                      {renderInputField("Category", "Longside Lower")}
                      {renderInputField("Section/block", "Longside Lower")}
                    </div>
                  </>
                )}

                {level.id === 2 && (
                  <>
                    <p className="mb-4">{level.detail}</p>
                    <div className="blocks -mx-2.5 flex flex-wrap">
                      {renderInputField("Category", "Longside Lower")}
                      {renderInputField("Section/block", "Block 111")}
                    </div>
                    <p className="mb-4 mt-3">
                      ▪ Same as Category where block-specific options
                      unavailable
                    </p>
                    <div className="blocks -mx-2.5 flex flex-wrap">
                      {renderInputField("Category", "Floor Standing")}
                      {renderInputField("Section/block", "Floor Standing")}
                    </div>
                  </>
                )}

                {level.id === 3 && (
                  <>
                    <div className="blocks -mx-2.5 flex flex-wrap">
                      {renderTicketsInHandField()}
                    </div>
                    <p className="mt-3">{level.detail}</p>
                  </>
                )}

                {level.id === 4 && (
                  <>
                    <div className="blocks -mx-2.5 flex flex-wrap">
                      {renderUploadTicketsField()}
                    </div>
                    <p className="mt-3">{level.detail}</p>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Price Suggestions */}
          <div className="single-level bg-gray-100/50 rounded-lg md:p-5 p-3.5 md:pt-4 mt-5">
            <div className="title-level flex flex-wrap items-center mb-3">
              <h2 className="leading-5 text-sm15 font-semibold">
                Price suggestions
              </h2>
            </div>
            <div className="level_content text-sm13">
              <p className="mb-3">
                Suggestions are provided on the Add Listings keyboard and within
                the Proceed price field.
              </p>

              <div className="mb-4">
                <label className="block mb-2 font-semibold">
                  Select Price Category:
                </label>
                <select
                  value={priceCategory}
                  onChange={(e) => setPriceCategory(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="green">Green - Competitive</option>
                  <option value="orange">Orange - Lower price likely</option>
                  <option value="red">Red - Not likely to sell</option>
                  <option value="blue">Blue - Too low</option>
                </select>
              </div>

              {priceCategories.map((category) => (
                <div
                  key={category.color}
                  className={`meter_info flex flex-wrap flex-col mb-[0.9375rem] ${
                    priceCategory === category.color
                      ? "border-2 border-blue-500 p-2 rounded"
                      : ""
                  }`}
                >
                  <div className="info_block gap-x-0.5 flex flex-nowrap border border-gray-400 rounded p-[0.1875rem] bg-white max-w-[8.75rem] mb-2.5">
                    <span className="rounded-l-sm bg-violet-500 text-white w-[4.125rem] p-[0.1875rem]"></span>
                    <span
                      className={`w-[0.9375rem] ${category.bg} p-[0.1875rem]`}
                    ></span>
                    <span
                      className={`w-[0.9375rem] ${category.bg} p-[0.1875rem]`}
                    ></span>
                    <span
                      className={`w-[0.9375rem] ${category.bg} p-[0.1875rem]`}
                    ></span>
                    <span
                      className={`w-[0.9375rem] ${category.bg} p-[0.1875rem] rounded-r-sm`}
                    ></span>
                  </div>
                  <p className="leading-4">{category.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fields that don't affect quality */}
          <div className="not_affect bg-gray-100/50 rounded-lg md:p-5 p-3.5 md:pt-4 mt-5">
            <h2 className="leading-5 text-sm15 font-semibold">
              The following fields do not affect Listing Quality levels
            </h2>
            <p className="mt-3 text-sm13">
              Split type, Max display quantity, Row, First seat, Benefits,
              Restrictions*
            </p>
            <p className="mt-2 text-sm13">
              *Failure to disclose Restrictions can result in cancellation and a
              penalty on your account.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketListingQuality;
