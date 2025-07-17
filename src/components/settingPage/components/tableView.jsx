import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";

const TableView = (props) => {
  const {
    headerClassName,
    rowClassName,
    currentUsers,
    handleEditClick,
    handleDeleteClick,
    loading, // Add loading state from parent
  } = props;

  // For mobile view - card style display
  // Update the renderMobileView function in TableView.jsx
  const renderMobileView = () => {
    return (
      <div className="flex flex-col gap-3 sm:hidden">
        {loading ? (
          <div className="space-y-4">
            {/* Shimmer effect for loading cards */}
            <div className="bg-gray-200 animate-pulse rounded-md p-4">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="bg-gray-200 animate-pulse rounded-md p-4">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ) : currentUsers && currentUsers.length > 0 ? (
          currentUsers.map((user, index) => (
            <div key={index} className="border rounded-md border-[#eaeaf1] p-3">
              <div className="flex justify-between items-center border-b border-[#eaeaf1] pb-2 mb-2">
                <span className="font-medium text-sm">
                  {user.first_name} {user.last_name}
                </span>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-[#343432] hover:text-[#130061]"
                  >
                    <IconStore.pencilEdit className="size-4 stroke-[#130061]" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="text-[#343432] "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="12.5"
                      viewBox="0 0 10 12.5"
                      className="w-2.5 h-[.8125rem]"
                    >
                      <g
                        id="Group_24"
                        data-name="Group 24"
                        transform="translate(-433.5 -128.5)"
                      >
                        <path
                          id="Rectangle_71"
                          data-name="Rectangle 71"
                          d="M0,0H9A0,0,0,0,1,9,0V8A1,1,0,0,1,8,9H1A1,1,0,0,1,0,8V0A0,0,0,0,1,0,0Z"
                          transform="translate(434 132)"
                        ></path>
                        <rect
                          id="Rectangle_72"
                          data-name="Rectangle 72"
                          width="10"
                          height="1.5"
                          transform="translate(433.5 129.5)"
                        ></rect>
                        <rect
                          id="Rectangle_73"
                          data-name="Rectangle 73"
                          width="5"
                          height="2"
                          transform="translate(436 128.5)"
                        ></rect>
                      </g>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-right">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span>
                    {user.country_code} {user.mobile_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Country:</span>
                  <span>{user.country}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="border rounded-md border-[#eaeaf1] p-4 text-center text-gray-500">
            No records found
          </div>
        )}
      </div>
    );
  };
  // For tablet and desktop view - table style display
  const renderTableView = () => {
    return (
      <div className="w-full border-[1px] hidden sm:block max-h-[calc(100vh-400px)] overflow-auto border-[#eaeaf1] rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left">
              <th className={headerClassName}>Name</th>
              <th className={headerClassName}>Email</th>
              <th className={headerClassName}>Phone</th>
              <th className={headerClassName}>Country</th>
              <th className={headerClassName}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 space-y-4">
                  {/* Shimmer effect for table rows */}
                  <div className="bg-gray-200 animate-pulse h-8 rounded w-full mb-2"></div>
                  <div className="bg-gray-200 animate-pulse h-8 rounded w-full mb-2"></div>
                  <div className="bg-gray-200 animate-pulse h-8 rounded w-full mb-2"></div>
                  <div className="bg-gray-200 animate-pulse h-8 rounded w-full mb-2"></div>
                </td>
              </tr>
            ) : currentUsers && currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className={rowClassName}>
                    {user.first_name} {user.last_name}
                  </td>
                  <td className={rowClassName}>{user.email}</td>
                  <td className={rowClassName}>
                    {user.country_code} {user.mobile_number}
                  </td>
                  <td className={rowClassName}>{user.country}</td>
                  <td className={rowClassName}>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-[#343432] cursor-pointer hover:text-[#130061]"
                      >
                        <IconStore.pencilEdit className="size-4 stroke-[#130061]" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-[#343432] hover:text-red-600 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="12.5"
                          viewBox="0 0 10 12.5"
                          className="w-2.5 h-[.8125rem]"
                        >
                          <g
                            id="Group_24"
                            data-name="Group 24"
                            transform="translate(-433.5 -128.5)"
                          >
                            <path
                              id="Rectangle_71"
                              data-name="Rectangle 71"
                              d="M0,0H9A0,0,0,0,1,9,0V8A1,1,0,0,1,8,9H1A1,1,0,0,1,0,8V0A0,0,0,0,1,0,0Z"
                              transform="translate(434 132)"
                            ></path>
                            <rect
                              id="Rectangle_72"
                              data-name="Rectangle 72"
                              width="10"
                              height="1.5"
                              transform="translate(433.5 129.5)"
                            ></rect>
                            <rect
                              id="Rectangle_73"
                              data-name="Rectangle 73"
                              width="5"
                              height="2"
                              transform="translate(436 128.5)"
                            ></rect>
                          </g>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {renderMobileView()}
      {renderTableView()}
    </>
  );
};

export default TableView;
