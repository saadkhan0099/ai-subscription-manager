// backend/src/services/cloudflareAI.js
import axios from "axios";

/**
 * Analyzes subscription text using Cloudflare Workers AI.
 * (For now, we’ll mock it until you get your API key)
 */
export async function analyzeSubscription(subscriptionText) {
  try {
    if (!subscriptionText) {
      throw new Error("No subscription text provided");
    }

    // 🧠 Example call to Cloudflare Workers AI (replace later with real model)
    // const response = await axios.post("https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai/run/@cf/meta/llama-2-7b-chat-int8",
    //   { prompt: `Analyze the following subscriptions:\n${subscriptionText}` },
    //   { headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}` } }
    // );

    // Temporary mock response for testing:
    const mockResult = {
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

    return mockResult;
  } catch (err) {
    console.error("Cloudflare AI error:", err.message);
    throw err;
  }
}
