// Create time options in 30 minute increments for 24 hours
export const generateTimeOptions = () => {
  const times = [];
  let date = new Date();
  date.setHours(0, 0, 0, 0); // Start at 12:00 AM

  for (let i = 0; i < 48; i++) { // 48 intervals in 24 hours
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert 24-hour format to 12-hour format
    let adjustedHours = hours % 12;
    adjustedHours = adjustedHours ? adjustedHours : 12; // 12-hour format should show 12, not 0

    const formattedTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes} ${period}`;
    const timeValue = `${hours.toString().padStart(2, '0')}:${minutes}:00`
    const timeOption = { time: formattedTime, value: timeValue};
    times.push(timeOption);

    date.setMinutes(date.getMinutes() + 30);
  }
  return times
}

export function isTime1EarlierThanTime2(time1: string | undefined, time2: string | undefined) {
  if (!time1 || !time2) return new Error("Time1 and Time2 must be defined");

  const [hours1, minutes1, seconds1] = time1.split(":").map(Number);
  const [hours2, minutes2, seconds2] = time2.split(":").map(Number);

  if (hours1 < hours2) return true;
  if (hours1 > hours2) return false;

  if (minutes1 < minutes2) return true;
  if (minutes1 > minutes2) return false;

  return seconds1 <= seconds2;
}

export function formatTime(time: string) {
  const [hours, minutes, _] = time.split(':');
  const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
  const adjustedHours = parseInt(hours) % 12 || 12; // 12-hour format should show 12, not 0

  return `${adjustedHours}:${minutes} ${period}`;
}

export function formatDate(date: string) {
  // Split the input date string into components
  const [year, month, day] = date.split('-');
  
  // Extract the last two digits of the year
  const shortYear = year.slice(-2);

  // Return the date in "mm/dd/yy" format
  return `${month}/${day}/${shortYear}`;
}

// Convert an index from 0 to 47 to a time in 30-minute increments
export function indexToTime(index: number) {
  if (index < 0 || index > 47) {
    throw new Error('Index must be between 0 and 47');
  }

  let hours = Math.floor(index / 2);
  const period = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // 12-hour format should show
  
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${hours.toString()}:${minutes}${period}`;
}

// Convert HH:MM:SS to an index from 0 to 47
export function timeToIndex(time: string) {
  const [hours, minutes, _] = time.split(':');
  const index = parseInt(hours) * 2 + (parseInt(minutes) / 30);
  return index;
}