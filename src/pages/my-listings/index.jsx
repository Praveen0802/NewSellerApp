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
import React from "react";

const Tickets = (props) => {
  return <TicketsPage {...props} />;
};

export default Tickets;

export async function getServerSideProps(ctx) {
  console.log(ctx?.query, "ctx?.params;");
  const { success = "" } = ctx?.query;
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }
  const response = await getMyListingPageData(authToken);
  return {
    props: { success: success, response: response ?? {} },
  };
}
