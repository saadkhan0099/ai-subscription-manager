// services/circleWallets.js
export async function createTransfer(
  fromWalletId,
  toAddress,
  amount,
  currency
) {
  // Input validation
  if (!fromWalletId || typeof fromWalletId !== "string")
    throw new Error("Invalid fromWalletId");

  if (!toAddress || typeof toAddress !== "string")
    throw new Error("Invalid toAddress");

  if (typeof amount !== "number" || amount <= 0)
    throw new Error("Invalid amount");

  if (!currency || typeof currency !== "string")
    throw new Error("Invalid currency");

  // Simulate transfer
  console.log(
    `Simulating Circle transfer from ${fromWalletId} -> ${toAddress}: ${amount} ${currency}`
  );

  // Return a fake transaction ID
  return { id: "CIRCLE_FAKE_TX_123" };
}
