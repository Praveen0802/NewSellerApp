import { API_ROUTES } from "@/utils/apiHandler/apiRoutes";
import { parseCookie } from "@/utils/helperFunctions/cookie";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { headers, query } = req;
  const { booking_id } = query; // Extract booking_id from query parameters
  
  console.log(booking_id, "booking_id from query");
  
  const parsedCookie = parseCookie(headers?.cookie);
  const authToken = decodeURIComponent(parsedCookie?.auth_token);

  // Construct the URL with booking_id as query parameter
  const apiUrl = `${process.env.API_BASE_URL}${API_ROUTES?.MY_SALES_UPLOAD_TICKETS}${booking_id ? `?booking_id=${booking_id}` : ''}`;

  try {
    // Stream the request body directly to the external API
    const response = await axios({
      url: apiUrl,
      method: 'POST',
      data: req, // Pass the request stream directly
      headers: {
        ...headers, // Forward all original headers including content-type and content-length
        host: undefined, // Remove host header to avoid conflicts
        ...(authToken && {
          Authorization: `Bearer ${authToken}`,
        }),
        domainkey: process.env.DOMAIN_KEY,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    res.status(200).json(response?.data);
  } catch (err) {
    console.error("Error in save-listing API:", err.message);
    const statusCode = err?.response?.status || 500;
    const responseData = err?.response?.data || {
      message: "Internal Server Error",
    };
    res.status(statusCode).json(responseData);
  }
}