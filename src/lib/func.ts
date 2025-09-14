/*
 * general purpose functions
 */

import { groups } from "./stores/groups.svelte";

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
}
