export default function readDate(date) {
  const newDate = new Date(date);

  function zerofy(digit) {
    let stringfromDigit = digit.toString();
    if (stringfromDigit.length === 1) {
      stringfromDigit = `0${stringfromDigit}`;
    }
    return stringfromDigit;
  }

  let year = newDate.getFullYear();
  year = year.toString().substring(2, 4);

  let month = newDate.getMonth() + 1;
  month = zerofy(month);

  let day = newDate.getDate();
  day = zerofy(day);

  let hour = newDate.getHours();
  hour = zerofy(hour);

  let minutes = newDate.getMinutes();
  minutes = zerofy(minutes);

  let seconds = newDate.getSeconds();
  seconds = zerofy(seconds);

  const readedDate = `${hour}:${minutes}:${seconds} ${day}.${month}.${year}`;

  return readedDate;
}
