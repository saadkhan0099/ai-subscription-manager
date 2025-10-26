// services/arc.js
export async function sendUSDC(toAddress, amount_cents) {
  // Basic validation
  if (!toAddress || typeof toAddress !== "string")
    throw new Error("Invalid recipient address");

  if (!Number.isInteger(amount_cents) || amount_cents <= 0)
    throw new Error("Invalid amount");

  // Simulate a transaction
  console.log(`Simulating USDC send to ${toAddress} for ${amount_cents} cents`);

  // Return a fake transaction receipt
  return { transactionHash: "0xFAKEHASH1234567890" };
}
