import BulkListings from "@/components/TicketsPage/bulkListing";
import {
  checkValidAuthToken,
  getAuthToken,
  nextRedirect,
} from "@/utils/helperFunctions";
import { fetchBulkListingData } from "@/utils/serverSideRequests";
import React from "react";

const Tickets = (props) => {
  return <BulkListings {...props}/>;
};

export default Tickets;

export async function getServerSideProps(ctx) {
  const validToken = checkValidAuthToken(ctx);
  const authToken = getAuthToken(ctx);
  if (!validToken) {
    return nextRedirect("login");
  }
  const response = await fetchBulkListingData(authToken);
  return {
    props: { response },
  };
}
