export const isValidWorkingTime = () => {
  const startTime = "11:00:00"; // 11AM
  const endTime = "20:00:00"; // 8PM

  const currentDate = new Date();

  const startDate = new Date(currentDate.getTime());
  startDate.setHours(startTime.split(":")[0]);
  startDate.setMinutes(startTime.split(":")[1]);
  startDate.setSeconds(startTime.split(":")[2]);

  const endDate = new Date(currentDate.getTime());
  endDate.setHours(endTime.split(":")[0]);
  endDate.setMinutes(endTime.split(":")[1]);
  endDate.setSeconds(endTime.split(":")[2]);

  return startDate <= currentDate && endDate >= currentDate;
};

export const formatTime = (time) => {
  if (!time) {
    return "-";
  }

  const currentDate = new Date(time);
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();

  let am_pm = "AM";

  // If hours is more than 12, reduce 12 from it
  // And add PM.
  if (hours > 12) {
    hours -= 12;
    am_pm = "PM";
  }

  // Add zeros to hours/minutes/seconds if single digit
  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  return `${hours}:${minutes} ${am_pm}`;
};

export const calculateTotalBreakTime = (
  currentTime,
  signInTime,
  signOutTime,
  breaks
) => {
  // If there are no breaks, return 0
  if (!breaks || !breaks.length) {
    return 0;
  }

  let endTime;

  if (signOutTime) {
    endTime = signOutTime;
  } else {
    endTime = currentTime;
  }

  let totalBreakTimeInMilliSecs = 0;

  breaks.forEach((breakTuple) => {
    const breakStart = breakTuple[0];
    const breakEnd = breakTuple[1];

    if (breakStart && breakEnd) {
      totalBreakTimeInMilliSecs += breakEnd - breakStart;
    } else if (!breakEnd) {
      totalBreakTimeInMilliSecs += endTime - breakStart;
    }
  });

  const totalBreakTime = totalBreakTimeInMilliSecs / 1000;

  return totalBreakTime;
};

export const showSecondsInTime = (secs) => {
  if (!secs) {
    return "00:00:00";
  }

  let hours = Math.floor(secs / 3600);
  let minutes = Math.floor((secs % 3600) / 60);
  let seconds = Math.floor((secs % 3600) % 60);

  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${hours}:${minutes}:${seconds}`;
};

export const showBreakTime = (currentTime, signInTime, signOutTime, breaks) => {
  const totalBreakTime = calculateTotalBreakTime(
    currentTime,
    signInTime,
    signOutTime,
    breaks
  );
  const timeString = showSecondsInTime(totalBreakTime);

  return timeString;
};

export const calculateTotalActiveTime = (
  currentTime,
  signInTime,
  signOutTime,
  breaks
) => {
  if (!signInTime && !signOutTime) {
    return 0;
  }

  let endTime;

  if (signOutTime) {
    endTime = signOutTime;
  } else {
    endTime = currentTime;
  }

  const totalBreakTime = calculateTotalBreakTime(
    currentTime,
    signInTime,
    signOutTime,
    breaks
  );
  const lapsedTime = (endTime - signInTime) / 1000;

  return lapsedTime - totalBreakTime;
};

export const showActiveTime = (
  currentTime,
  signInTime,
  signOutTime,
  breaks
) => {
  const totalActiveTime = calculateTotalActiveTime(
    currentTime,
    signInTime,
    signOutTime,
    breaks
  );
  const timeString = showSecondsInTime(totalActiveTime);

  return timeString;
};
