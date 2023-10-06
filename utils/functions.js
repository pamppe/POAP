const doFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok) {
      const message = json.error
        ? `${json.message}: ${json.error}`
        : json.message;
      throw new Error(message || response.statusText);
    }
    return json;
  } catch (error) {
    throw new Error('doFetch failed: ' + error.message);
  }
};

function formatDate(date) {
  const currentDate = new Date();
  const postDate = new Date(date);
  const difference = timeDifference(currentDate, postDate);

  if (difference.hours < 1) {
    return 'just now';
  } else if (difference.hours < 24) {
    return `${difference.hours} hour${difference.hours > 1 ? 's' : ''} ago`;
  } else {
    // Calculate total days based on hours
    const totalDays = Math.floor(difference.hours / 24);
    return `${totalDays} day${totalDays > 1 ? 's' : ''} ago`;
  }
}

function timeDifference(currentDate, postDate) {
  const difference = currentDate - postDate;
  let seconds = Math.floor(difference / 1000);
  const minutesTotal = Math.floor(seconds / 60);
  seconds = seconds % 60;
  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;

  return {hours, minutes, seconds};
}

export {doFetch, formatDate};
