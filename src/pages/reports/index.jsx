import ReportsPage from "@/components/reportsPage";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import { fetchWalletPageDetails } from "@/utils/serverSideRequests";
import React from "react";

const Reports = (props) => {
  return <ReportsPage {...props} />;
};

export default Reports;

export async function getServerSideProps(ctx) {
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }
  const response = await fetchWalletPageDetails(authToken);
  return nextRedirect("reports/wallet");
  return {
    props: { apiData: response ?? {} },
  };
}
