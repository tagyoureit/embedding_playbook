import { httpGet, httpPost } from "utils";

// TODO - Param me
const tableau_domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN; // URL for Tableau environment
// const tableau_domain = 'https://10az.online.tableau.com'; // URL for Tableau environment
const pulse_path = '/api/-/pulse'; // path to resource

// returns stringified payload to form responses
export const makePayload = async (rest_key, metric) => {
  if (rest_key && metric) {
    let bundle;
    try {
      console.debug("Calling getInsightBundle with:"); // , { rest_key, metric });
      // request insights
      bundle = await getInsightBundle(rest_key, metric, '/detail');
      console.debug("Received bundle from getInsightBundle:", bundle);
    } catch (err) {
      console.error("Error in getInsightBundle:", err);
      return null;
    }
    return bundle;
  } else {
    // errors resolve to false
    const err = new Error('Cannot perform operation without required params');
    console.error(err);
    return err;
  }
}


// requests insight bundles for all supported types given a metric (params)
const getInsightBundle = async (apiKey, metric, resource) => {
  const body = makeBundleBody(metric);
  const endpoint = `${tableau_domain}${pulse_path}/insights${resource}`;

  const request = new Request(endpoint, {
    method: 'POST',
    headers: {
      'X-Tableau-Auth': apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  console.debug("Sending request to endpoint:", endpoint);
  console.debug("Request body:"); //, JSON.stringify(body, null, 2));

  const maxRetries = 3;
  const delay = 1000;
  let retryCount = 0;

  while (true) {
    try {
      const res = await fetch(request);

      // Check for successful response
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType === 'text/html') {
          const errorText = await res.text();
          console.error("Received HTML error response:", errorText);
          throw new Error(errorText);
        } else if (contentType === 'application/json') {
          const jsonData = await res.json();
          console.debug("Received JSON response:"); // , JSON.stringify(jsonData, null, 2)); // Log the response here if needed
          return jsonData; // Return the JSON data
        } else {
          throw new Error("Unexpected response type");
        }
      }

      // Handle specific HTTP error codes
      if (res.status === 429) {
        console.error("Rate limit exceeded. Retrying...");
        const retryAfter = res.headers.get('Retry-After');
        console.error(`Retry after: ${retryAfter} seconds`);
        throw new Error(`Rate limit exceeded. Retry after: ${retryAfter} seconds`);
      } else if (res.status === 500) {
        console.error("Internal server error.");
        const errorText = await res.text();
        console.error(`Error details: ${errorText}`);
        throw new Error(`Internal server error: ${errorText}`);
      } else {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
    } catch (error) {
      retryCount++;
      console.error(`Error in getInsightBundle fetch (retry ${retryCount} of ${maxRetries}):`, error.message);

      if (retryCount >= maxRetries) {
        console.error(`Max retries exceeded (${maxRetries}).`);
        throw error;
      }

      console.debug(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};



// generates the complex request body required to generate an insights bundle
const makeBundleBody = (metric) => {
  // calculate time for "now" value in required format
  const currentTime = new Date();

  // Format the date and time to 'YYYY-MM-DD HH:MM:SS'
  const formattedDate = currentTime.getFullYear() +
    "-" + ("0" + (currentTime.getMonth() + 1)).slice(-2) +
    "-" + ("0" + currentTime.getDate()).slice(-2) +
    " " + ("0" + currentTime.getHours()).slice(-2) +
    ":" + ("0" + currentTime.getMinutes()).slice(-2) +
    ":" + ("0" + currentTime.getSeconds()).slice(-2);

  // Get the time zone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // all other object members
  const {
    name, id, specification_id, definition, specification,
    extension_options, representation_options, insights_options,
  } = metric;

  const body = {
    bundle_request: {
      version: "1",
      options: {
        output_format: "OUTPUT_FORMAT_TEXT",
        now: formattedDate,
        time_zone: timeZone
      },
      input: {
        metadata: {
          name: name,
          metric_id: specification_id,
          definition_id: id
        },
        metric: {
          definition: definition,
          metric_specification: specification,
          extension_options: extension_options,
          representation_options: representation_options,
          insights_options: insights_options
        }
      }
    }
  }

  console.debug("Generated bundle body:", body);
  return body;
}
