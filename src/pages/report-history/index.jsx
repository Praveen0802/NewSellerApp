import ReportHistory from "@/components/reportHistoryPage";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import { reportHistoryData } from "@/utils/serverSideRequests";
import React from "react";

const reportHistoryPage = (props) => {
  return <ReportHistory {...props} />;
};

export default reportHistoryPage;

export async function getServerSideProps(ctx) {
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }
  const response = await reportHistoryData( authToken);
  return {
    props: { response },
  };
}
