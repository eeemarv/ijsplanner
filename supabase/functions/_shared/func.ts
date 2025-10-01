/*
 * general purpose functions
 */

export const capitalize = (str: string):string =>{
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getTimeStr = (timestamp:string):string => {
  const t = new Date(timestamp + 'Z');
  const h = t.getUTCHours();
  const m = t.getUTCMinutes();
  return h + 'u' + (m ? m.toString().padStart(2, '0') : '');
};

export const dateToISOWeek = (d: Date) => {
  var date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  var week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86_400_000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
};
