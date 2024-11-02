export const parseUrlLink = (path: string): string => {
  const url_link = `${process.env.HOST_NAME}/${path}`;
  return url_link;
};
