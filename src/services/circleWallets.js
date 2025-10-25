// Correct named export
// export async function createTransfer(
//   fromWalletId,
//   toAddress,
//   amount,
//   currency
// ) {
//   // ...
// }

// backend/src/services/circleWallets.js
export async function createTransfer(
  fromWalletId,
  toAddress,
  amount,
  currency
) {
  console.log(
    `Simulating Circle transfer from ${fromWalletId} -> ${toAddress}: ${amount} ${currency}`
  );
  return { id: "CIRCLE_FAKE_TX_123" };
}
