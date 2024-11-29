import * as QRCode from 'qrcode';

export const parseUrlLink = (path: string): string => {
  const url_link = `${process.env.HOST_NAME}/${path}`;
  return url_link;
};

export const parsePaymentLink = (price: number, content: string) => {
  return `https://api.vietqr.io/image/970422-0825999871-zjGNUA0.jpg?accountName=HUYNH%20CHI%20BAO&amount=${price}&addInfo=${content}`;
};

export const getNameOfPath = (path: string): string => {
  const arr = path.split('/');
  return arr[arr.length - 1];
};

export const parseQrCodeLink = async (path: string): Promise<string> => {
  return await QRCode.toDataURL(parseUrlLink(path));
};
