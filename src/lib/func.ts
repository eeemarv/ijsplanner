/*
 * general purpose functions
 */

import { groups } from "./stores/groups.svelte";

export const dateToJulian = (d: Date): number => {
  return 2_440_588 + Math.trunc(d.getTime() / 86_400_000);
};

export const dateStrToJulian = (dateStr:string):number => {
  return dateToJulian(new Date(dateStr + 'Z'));
};

export const julianToDate = (julian: number):Date => {
  return new Date((julian - 2_440_588) * 86_400_000);
};

export const capitalize = (str: string):string =>{
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const id2 = (key1: string, key2: string):string => {
  return `${key1}:${key2}`;
};

export const hmToTime = (hours: number, minutes: number): string => {
  return `${hours.toString()
    .padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

export const timeToHM = (time: string): { hours: number; minutes: number } => {
  const [h, m] = time.split(':').map(Number);
  return { hours: h, minutes: m };
};

export const timeToMinutes = (time: string):number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const getGroupName = (id: string): string | null => {
  const name = groups.map.get(id);
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : null;
};

export const weekDayNames:string[] = [
  'Maandag','Dinsdag',
  'Woensdag','Donderdag',
  'Vrijdag','Zaterdag','Zondag'
];

export const getTimeStr = (hours: number, minutes: number):string => {
  return hours + 'u' + (minutes ? minutes.toString().padStart(2, '0') : '');
};

/*
export const dateToISOWeek = (d: Date) => {
  const jan = new Date(d.getUTCFullYear(), 0, 1); // January 1st
  const days = Math.floor((d.getTime() - jan.getTime()) / 86400000);
  const dow = (jan.getUTCDay() + 6) % 7; // day of the week, monday: 0
  return Math.floor((days + dow) / 7) + 1;
};
*/

export const dateToISOWeek = (d: Date) => {
  var date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  var week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86_400_000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
};
