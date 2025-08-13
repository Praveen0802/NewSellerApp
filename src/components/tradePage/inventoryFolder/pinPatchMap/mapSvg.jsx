import React, { useEffect, useRef, useState } from "react";
import InlineSVG from "./inLineSvg";

const StadiumMap = ({
  svgUrl,
  stadiumData,
  transformState,
  displayTicketDetails: ticketData,
  commonProps,
}) => {
  const { svgContainerRef, currentCategoryRef, handleMapBlockClick } =
    commonProps;
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);

  const MAX_RETRIES = 5;
  const tooltipRef = useRef(null);
  const svgLoadedRef = useRef(false);

  // Apply category styles to the SVG elements
  const applyCategoryStyles = (data) => {
    if (!svgContainerRef.current) {
      console.warn("SVG container ref is not available");
      return;
    }

    let stylesApplied = 0;
    data?.forEach((item) => {
      const blockSelector = `[data-section="${item.full_block_name}"] .block`;
      const sectionSelector = `[data-section="${item.full_block_name}"]`;

      const block = svgContainerRef.current.querySelector(blockSelector);
      const section = svgContainerRef.current.querySelector(sectionSelector);

      if (block) {
        block.style.fill = item.block_color;
        block.setAttribute("data-category-id", item.category);
        block.setAttribute("data-color", item.block_color);
        stylesApplied++;

        if (section) {
          if (item.total_count > 0) {
            section.classList.add("dark");
            section.setAttribute("data-category-name", item.seat_category);
            section.setAttribute("data-price", item.price);
            section.setAttribute(
              "data-label-name",
              `${
                item.total_count
                  ? `${item.total_count} listings from ${item.min_price_with_symbol}`
                  : ""
              }`
            );
          } else if (item.price) {
            section.classList.add("dark");
            section.setAttribute("data-category-name", item.seat_category);
            section.setAttribute("data-price", item.price);
          }
        }
      } else {
        console.warn(`Block not found for ${item.full_block_name}`);
      }
    });

    // If no styles were applied but we have data, try again after a short delay
    if (stylesApplied === 0 && data?.length > 0) {
      setTimeout(() => applyCategoryStyles(data), 200);
    } else {
      // We applied some styles, so mark loading as complete
      setIsLoading(false);
    }
  };

  // Function to darken RGBA color for visual effects
  function darkenRgbaColor(rgbaStr, amount = 30) {
    const match = rgbaStr.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (!match) return rgbaStr; // fallback to original if parsing fails

    let [r, g, b, a] = match
      .slice(1)
      .map((val, i) =>
        i < 3 ? Math.max(0, parseInt(val) - amount) : parseFloat(val ?? 1)
      );
    return `rgba(${r},${g},${b},${a})`;
  }

  // Handle section click
  const handleSectionClick = (e) => {
    const section = e.currentTarget;
    const clickedCategoryId = section
      .querySelector(".block")
      ?.getAttribute("data-category-id");
    if (!clickedCategoryId) return;

    // Store the selected category in the ref
    currentCategoryRef.current = clickedCategoryId;

    // Reset all blocks to their original color
    svgContainerRef.current
      .querySelectorAll("[data-section] .block")
      .forEach((block) => {
        const originalColor = block.getAttribute("data-color");
        if (originalColor) block.style.fill = originalColor;
      });

    // Highlight selected category blocks
    svgContainerRef.current
      .querySelectorAll(`[data-category-id="${clickedCategoryId}"]`)
      .forEach((block) => {
        block.style.fill = "#7d7af9"; // Highlight color
      });

    // Update text color for better visibility
    svgContainerRef.current.querySelectorAll("text").forEach((text) => {
      const block = text.closest("[data-section]")?.querySelector(".block");
      const blockCategoryId = block?.getAttribute("data-category-id");
      text.style.fill = blockCategoryId === clickedCategoryId ? "#fff" : "#000";
    });

    // Update the block ID state
    const blockIdFull = section.getAttribute("data-section");
    const parts = blockIdFull.split("_");
    console.log(parts,blockIdFull,'blockIdFullblockIdFullblockIdFull');
    const blockId = parts.length > 1 ? parts[1] : null;

    handleMapBlockClick(clickedCategoryId);
  };

  // Handle mouse enter on section
  const handleMouseEnter = (e) => {
    const section = e.currentTarget;
    const cg_id = section
      .querySelector(".block")
      ?.getAttribute("data-category-id");

    // Add hover class to all sections to dim them
    svgContainerRef.current
      .querySelectorAll("[data-section]")
      .forEach((el) => el.classList.add("hover"));

    // Remove hover class from sections with matching category ID to highlight them
    if (cg_id) {
      svgContainerRef.current
        .querySelectorAll(`[data-category-id="${cg_id}"]`)
        .forEach((el) => {
          el.closest("[data-section]")?.classList.remove("hover");
          el.style.fill = "#7d7af9"; // Highlight color

          // Update text color for better visibility
          const section = el.closest("[data-section]");
          section?.querySelector("text")?.style &&
            (section.querySelector("text").style.fill = "#fff");
        });
    }

    // Show tooltip if section has price data
    if (
      section.hasAttribute("data-price") &&
      section.hasAttribute("data-category-name") &&
      tooltipRef.current
    ) {
      const categoryName = section.getAttribute("data-category-name");
      const price = section.getAttribute("data-price");
      const labelName = section.getAttribute("data-label-name") || "";

      tooltipRef.current.innerHTML = labelName
        ? `${categoryName}<br>${labelName}`
        : `Category: ${categoryName}<br>Price: ${price}`;
      tooltipRef.current.style.display = "block";

      // Position the tooltip
      updateTooltipPosition(e);
    }
  };

  // Update tooltip position
  const updateTooltipPosition = (e) => {
    if (!tooltipRef.current || !svgContainerRef.current) return;

    const tooltipWidth = tooltipRef.current.offsetWidth;
    const tooltipHeight = tooltipRef.current.offsetHeight;

    // Get the SVG container's bounding rect
    const svgRect = svgContainerRef.current.getBoundingClientRect();

    // Calculate position relative to the SVG container
    let left = e.clientX - svgRect.left;
    let top = e.clientY - svgRect.top;

    // Add some offset
    left += 15;
    top += 15;

    // Prevent tooltip from going off the container
    if (left + tooltipWidth > svgRect.width) {
      left = left - tooltipWidth - 30;
    }

    if (top + tooltipHeight > svgRect.height) {
      top = top - tooltipHeight - 30;
    }

    // Account for zoom level if transformState is provided
    const scale = transformState ? transformState.scale : 1;

    tooltipRef.current.style.left = `${left}px`;
    tooltipRef.current.style.top = `${top}px`;
    tooltipRef.current.style.transform = `scale(${1 / scale})`;
  };

  // Handle mouse move for tooltip positioning
  const handleMouseMove = (e) => {
    if (tooltipRef.current && tooltipRef.current.style.display === "block") {
      updateTooltipPosition(e);
    }
  };

  // Handle mouse leave for sections
  const handleMouseLeave = () => {
    // Remove hover class from all sections
    svgContainerRef.current
      .querySelectorAll("[data-section]")
      .forEach((section) => {
        section.classList.remove("hover");

        // Restore original colors for blocks not in the current category
        const block = section.querySelector(".block");
        const text = section.querySelector("text");
        const blockCategoryId = block?.getAttribute("data-category-id");
        const currentCategory = currentCategoryRef.current;

        if (block && blockCategoryId !== currentCategory) {
          const originalColor = block.getAttribute("data-color");
          if (originalColor) block.style.fill = originalColor;
        }

        if (text) {
          text.style.fill =
            blockCategoryId === currentCategory ? "#fff" : "#000";
        }
      });

    // Hide tooltip
    if (tooltipRef.current) {
      tooltipRef.current.style.display = "none";
    }
  };

  // Setup the tooltip and event handlers
  const setupTooltipAndEvents = () => {
    if (!svgContainerRef.current) return;

    // Add price indicators
    const addPriceIndicators = () => {
      svgContainerRef.current
        .querySelectorAll("g[data-price]")
        .forEach((element) => {
          const existingCircle = element.querySelector(
            "circle[data-price-indicator]"
          );

          if (!existingCircle) {
            const textEl = element.querySelector("text");
            const blockEl = element.querySelector(".block");

            if (textEl && blockEl) {
              const tf = textEl.getAttribute("transform") || "";
              const color = blockEl.getAttribute("data-color") || "#ff0000";
              const bbox = textEl.getBBox();
              const height = Math.round(bbox.height);
              const boxHeight = height - 4;
              const circleMarkup = `<circle transform="${tf}" class="circle-style" cx="${boxHeight}" r="6" fill="${darkenRgbaColor(
                color,
                40
              )}" data-price-indicator="true" style="pointer-events:auto; cursor: pointer;" />`;
              element.insertAdjacentHTML("beforeend", circleMarkup);
            }
          }
        });
    };

    // Add event listeners to sections
    const sections = svgContainerRef.current.querySelectorAll("[data-section]");

    sections.forEach((section) => {
      // Remove existing event listeners to prevent duplicates
      section.removeEventListener("click", handleSectionClick);
      section.removeEventListener("mouseenter", handleMouseEnter);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);

      // Add fresh event listeners
      section.addEventListener("click", handleSectionClick);
      section.addEventListener("mouseenter", handleMouseEnter);
      section.addEventListener("mousemove", handleMouseMove);
      section.addEventListener("mouseleave", handleMouseLeave);
    });

    // Add price indicators
    // addPriceIndicators();
  };

  // Handle SVG load
  const handleSvgLoad = (svgElement) => {
    svgLoadedRef.current = true;

    // Force set the exact size of 450x400
    if (svgElement) {
      svgElement.setAttribute("width", "450");
      svgElement.setAttribute("height", "400");

      // Make sure the viewBox is set correctly to maintain proportions
      if (!svgElement.getAttribute("viewBox")) {
        const originalWidth = svgElement.width?.baseVal?.value || 700;
        const originalHeight = svgElement.height?.baseVal?.value || 400;
        svgElement.setAttribute(
          "viewBox",
          `0 0 ${originalWidth} ${originalHeight}`
        );
      }

      // Make sure preserveAspectRatio is set to properly scale
      svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }

    // Add a small delay to ensure DOM has been updated
    setTimeout(() => {
      if (svgContainerRef.current) {
        applyCategoryStyles(stadiumData);
        setupTooltipAndEvents();
      } else {
        console.warn("SVG Container ref is not available after timeout");
        // Force loading to false after several retries
        if (retryCount >= MAX_RETRIES) {
          setIsLoading(false);
        }
      }
    }, 300); // Increased timeout to 300ms
  };

  // Add stadium CSS styles
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      [data-section].hover .block {
        opacity: 0.3;
        transition: opacity 0.2s ease;
      }
      [data-section] .block {
        transition: opacity 0.2s ease;
        opacity: 1;
      }
      [data-section].dark {
        cursor: pointer;
      }
      .stadium-tooltip {
        position: absolute;
        display: none;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: none;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        min-width: 120px;
        text-align: center;
        max-width: 200px;
        white-space: nowrap;
        transition: opacity 0.2s ease;
        transform-origin: top left;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Effect to handle data changes after SVG is loaded
  useEffect(() => {
    if (
      svgLoadedRef.current &&
      svgContainerRef.current &&
      stadiumData?.length > 0
    ) {
      applyCategoryStyles(stadiumData);
      setupTooltipAndEvents();
    } else if (retryCount < MAX_RETRIES) {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (retryCount >= MAX_RETRIES) {
      console.warn("Max retries reached, forcing loading to false");
      setIsLoading(false);
    }

    // Cleanup function to remove event listeners on unmount
    return () => {
      if (svgContainerRef.current) {
        const sections =
          svgContainerRef.current.querySelectorAll("[data-section]");
        sections.forEach((section) => {
          section.removeEventListener("click", handleSectionClick);
          section.removeEventListener("mouseenter", handleMouseEnter);
          section.removeEventListener("mousemove", handleMouseMove);
          section.removeEventListener("mouseleave", handleMouseLeave);
        });
      }
    };
  }, [stadiumData, transformState, retryCount]);

  return (
    <div className="svg-stadium" onMouseLeave={handleMouseLeave}>
      <div
        className="svg-container"
        ref={svgContainerRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "450px",
          height: "400px",
          position: "relative",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              padding: "8px",
              borderRadius: "4px",
            }}
          >
            Loading stadium map...
          </div>
        )}
        <InlineSVG
          src={svgUrl}
          style={{ width: "450px", height: "400px" }}
          onLoad={handleSvgLoad}
          width="450"
          height="400"
        />
        <div
          ref={tooltipRef}
          className="stadium-tooltip"
          style={{
            position: "absolute",
            display: "none",
            zIndex: 10000,
          }}
        ></div>
      </div>
    </div>
  );
};

export default StadiumMap;
