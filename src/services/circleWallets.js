export async function createTransfer(
  fromWalletId,
  toAddress,
  amount,
  currency
) {
  if (!fromWalletId || typeof fromWalletId !== "string")
    throw new Error("Invalid fromWalletId");

  if (!toAddress || typeof toAddress !== "string")
    throw new Error("Invalid toAddress");

  if (typeof amount !== "number" || amount <= 0)
    throw new Error("Invalid amount");

  if (!currency || typeof currency !== "string")
    throw new Error("Invalid currency");

  console.log(
    `Simulating Circle transfer: ${fromWalletId} -> ${toAddress} = ${amount} ${currency}`
  );

  // Fake tx ID for demo
  return { id: "CIRCLE_FAKE_TX_123" };
}
