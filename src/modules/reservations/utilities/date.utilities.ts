export const getStartOfTheDay = (date?: Date): Date => {
  const dateValue = new Date(date || Date.now()).setHours(12, 0, 0, 0);
  return new Date(dateValue);
};

export const getEndOfTheDay = (date?: Date): Date => {
  const dateValue = new Date(date || Date.now()).setHours(23, 59, 59);
  return new Date(dateValue);
};
