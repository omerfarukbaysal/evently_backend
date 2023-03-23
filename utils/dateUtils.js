function getYesterday() {
  let date = new Date();
  date.setUTCMinutes(0);
  date.setUTCHours(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date;
}
function getNextDay() {
  let date = new Date();
  date.setUTCMinutes(59);
  date.setUTCHours(23);
  date.setUTCSeconds(59);
  date.setUTCMilliseconds(999);
  return date;
}
function isISODate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d) && d.toISOString() === str; // valid date
}
module.exports = { getYesterday, getNextDay, isISODate };
