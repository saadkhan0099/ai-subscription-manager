export async function sendUSDC(toAddress, amount_cents) {
  console.log(`Simulating USDC send to ${toAddress} for ${amount_cents} cents`);
  return { transactionHash: "0xFAKEHASH1234567890" };
}
