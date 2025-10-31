import axios from "axios";

export async function analyzeSubscription(subscriptionText) {
  if (typeof subscriptionText !== "string" || !subscriptionText.trim())
    throw new Error("Invalid subscription text");

  try {
    // Replace below with real Cloudflare AI API call if you have credentials
    // const response = await axios.post(`CLOUDFLARE_API_ENDPOINT`, { prompt: subscriptionText }, { headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}` } });
    // return response.data;

    // Mock response for demo
    return {
      subscriptions: [
        { name: "Netflix", amount: 15.99, status: "active" },
        {
          name: "Adobe Creative Cloud",
          amount: 52.99,
          status: "suggest_cancel",
        },
      ],
      totalActive: 1,
      totalCancel: 1,
      recommendation: "Cancel Adobe Creative Cloud to save $52.99/month.",
    };
  } catch (err) {
    console.error("Cloudflare AI error:", err.message);
    throw err;
  }
}
