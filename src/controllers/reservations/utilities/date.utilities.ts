export const getStartOfTheDay = (): Date => {
  const dateValue = new Date().setUTCHours(1, 0, 0, 0);
  return new Date(dateValue);
};

export const getEndOfTheDay = (): Date => {
  const dateValue = new Date().setUTCHours(20, 59, 59);
  return new Date(dateValue);
};
