//generate a random id
export const uid = () => {
  return Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36).slice(-4);
};
