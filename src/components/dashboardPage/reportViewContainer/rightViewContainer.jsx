import React, { useEffect, useRef } from "react";

const RightViewContainer = (props) => {
  const { tableView, handleScrollEnd, keyValue, meta, loader } = props;
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && handleScrollEnd) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        
        // Check if scrolled to bottom (with small buffer)
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          // Check if there are more pages to load and not currently loading
          if (meta && meta.current_page < meta.last_page && !loader) {
            handleScrollEnd(keyValue);
          }
        }
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScrollEnd, keyValue, meta, loader]);

  return (
    <div className="border-[1px] w-full md:w-[50%] border-[#eaeaf1] rounded-md">
      {/* Header */}
      <div className="flex justify-between items-center border-b-[1px] border-[#eaeaf1] p-2">
        {tableView?.head?.map((head, headIndex) => (
          <div key={headIndex} className="">
            <p className="text-[#7D82A4] text-[12px] font-normal">{head}</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div 
        ref={scrollRef}
        className="max-h-[250px] overflow-y-auto"
      >
        {tableView?.body?.map((body, bodyIndex) => {
          return (
            <div
              className="flex justify-between items-center border-b-[1px] border-[#eaeaf1] p-2 gap-2"
              key={bodyIndex}
            >
              <p className="text-[#343432] text-[12px] max-w-[220px] break-words whitespace-normal leading-snug">{body?.matchName}</p>
              <p className="text-[#343432] text-[12px] flex-shrink-0 text-right">{body?.revenue}</p>
            </div>
          );
        })}
        
        {/* Loading indicator */}
        {loader && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightViewContainer;