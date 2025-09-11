import TicketsPage from "@/components/TicketsPage";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import {
  getAddlistingPageData,
  getMyListingPageData,
} from "@/utils/serverSideRequests";
import { AlertTriangle, Home } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";

const Tickets = (props) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  const handleGoBack = () => {
    router.back();
  };
  return  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
  <div className="max-w-md w-full space-y-8 text-center">
    {/* 404 Icon */}
    <div className="flex justify-center">
      <AlertTriangle className="h-24 w-24 text-red-500" />
    </div>

    {/* 404 Title */}
    <div className="space-y-2">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700">
        Page Not Found
      </h2>
      {/* <p className="text-gray-500 mt-4">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p> */}
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={handleGoHome}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <Home className="w-5 h-5 mr-2" />
        Go Home
      </button>
    </div>

    {/* Additional Help Text */}
    <div className="mt-8 pt-8 border-t border-gray-200">
      <p className="text-sm text-gray-400">
        If you believe this is an error, please contact support or try
        refreshing the page.
      </p>
    </div>
  </div>
</div>//<TicketsPage {...props} />;
};

export default Tickets;

// export async function getServerSideProps(ctx) {
//   console.log(ctx?.query, "ctx?.params;");
//   const { success = "" } = ctx?.query;
//   const validToken = checkValidAuthToken(ctx);
//   const authToken = getAuthToken(ctx);
//   if (!validToken) {
//     return nextRedirect("login");
//   }
//   const response = await getMyListingPageData(authToken);
//   return {
//     props: { success: success, response: response ?? {} },
//   };
// }
