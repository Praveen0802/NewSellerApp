import React, { useRef, useEffect } from "react";

const TradeTicketsContainer = ({ 
  tracking, 
  className, 
  handleScrollEnd, 
  loader 
}) => {
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (element) {
      const { scrollTop, scrollHeight, clientHeight } = element;
      
      // Check if scrolled to bottom (with a small threshold)
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        // Check if there are more pages to load
        const meta = tracking?.meta;
        if (meta && meta.current_page < meta.last_page && !loader) {
          handleScrollEnd?.(tracking?.keyValue);
        }
      }
    }
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [tracking?.meta, loader]);

  return (
    <div className={`${className}`}>
      <div
        className={`flex items-center justify-between p-4 border-b-[1px] border-[#F0F0F5] `}
      >
        <div className="text-[13px] flex gap-1 text-[#343432] font-semibold">
          {tracking?.title}
          <span className="bg-[#0137D5] text-[10px] text-white px-[6px] py-[2px] rounded-full">
            {tracking?.count}
          </span>
        </div>
        <p className="text-[#7D82A4] text-[13px] font-normal">
          {tracking?.subHeading}
        </p>
      </div>
      <div 
        ref={scrollRef}
        className="flex flex-col overflow-auto max-h-[180px]"
      >
        {tracking?.listItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-2 border-b-[1px] border-[#F0F0F5]"
          >
            <p className="text-[#343432] text-[13px] font-normal">
              {item?.title}
            </p>
            <p className="text-[#343432] text-[13px] font-normal">
              {item?.amount}
            </p>
          </div>
        ))}
        {loader && (
          <div className="flex items-center justify-center p-4">
            <div className="text-[13px] text-[#7D82A4]">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeTicketsContainer;