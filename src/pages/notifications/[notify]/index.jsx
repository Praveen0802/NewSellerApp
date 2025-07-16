import NotificationPage from "@/components/notifications";
import {
  fetchActivityHistory,
  fetchNotificationHistory,
} from "@/utils/apiHandler/request";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import React from "react";

const Notification = (props) => {
  return <NotificationPage {...props} />;
};

export default Notification;

export async function getServerSideProps(ctx) {
  const { notify } = ctx?.query;
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }

  // Fetch SSR data for the notification page
  const getSSRData = async () => {
    let response = {};
    try {
      if (notify === "home") {
        response = await fetchNotificationHistory(authToken, {
          current_page: 1,
        });
      } else if (notify === "activity") {
        response = await fetchActivityHistory(authToken, { current_page: 1 });
      }
      return response ?? {};
    } catch (error) {
      console.error("Error fetching notification data:", error);
    }
  };
  
  const notifyData = await getSSRData();

  return {
    props: { notify, notifyData },
  };
}
