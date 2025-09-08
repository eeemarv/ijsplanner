/*
 * general purpose functions
 */

export const capitalize = (str: string):string =>{
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const id2 = (key1: string, key2: string):string => {
  return `${key1}:${key2}`;
};
