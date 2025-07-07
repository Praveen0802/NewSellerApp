import DashboardPage from "@/components/dashboardPage";
import { fetchDashboardData } from "@/utils/apiHandler/request";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import { fetchDashboardPageDetails } from "@/utils/serverSideRequests";
import React from "react";

const Dashboard = (props) => {
  return <DashboardPage {...props} />;
};

export default Dashboard;

export const getServerSideProps = async (context) => {
  const validToken = checkValidAuthToken(context);
  const authToken = getAuthToken(context);
  console.log("validToken", validToken);
  if (!validToken) {
    return nextRedirect("login");
  }
  // const response = await fetchDashboardData(authToken);
  const response = await fetchDashboardPageDetails(authToken);
  console.log("response", response);
  return {
    props: { response },
  };
};
