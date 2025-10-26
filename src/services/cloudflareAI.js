import axios from "axios";

/**
 * Analyzes subscription text using Cloudflare Workers AI.
 */
export async function analyzeSubscription(subscriptionText) {
  if (typeof subscriptionText !== "string" || !subscriptionText.trim()) {
    throw new Error("Invalid subscription text");
  }

  try {
    // 🧠 Real API call placeholder (replace with your account ID and key)
    // const response = await axios.post(
    //   `https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai/run/@cf/meta/llama-2-7b-chat-int8`,
    //   { prompt: `Analyze the following subscriptions:\n${subscriptionText}` },
    //   { headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}` } }
    // );
    // return response.data;

    // Mock response for testing/demo
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
