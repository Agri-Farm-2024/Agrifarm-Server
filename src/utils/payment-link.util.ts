export const parsePaymentLink = (price: number, content: string) => {
  return `https://api.vietqr.io/image/970422-0825999871-zjGNUA0.jpg?accountName=HUYNH%20CHI%20BAO&amount=${price}&addInfo=${content}`;
};
