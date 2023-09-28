const doFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    const message = json.error
      ? `${json.message}: ${json.error}`
      : json.message;
    throw new Error(message || response.statusText);
  }
  return json;
};

const formatDate = (date) => {
  date = new Date(date);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

export {doFetch, formatDate};
