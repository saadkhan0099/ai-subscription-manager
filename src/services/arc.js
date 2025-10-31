export async function sendUSDC(toAddress, amount_cents) {
  if (!toAddress || typeof toAddress !== "string")
    throw new Error("Invalid recipient address");

  if (!Number.isInteger(amount_cents) || amount_cents <= 0)
    throw new Error("Invalid amount");

  console.log(`Simulating USDC send to ${toAddress} for ${amount_cents} cents`);

  // Fake receipt
  return { transactionHash: "0xFAKEHASH1234567890" };
}
