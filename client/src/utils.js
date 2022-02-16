import { useState } from 'react';
import { v4 as uuidV4 } from "uuid";

export function useLocalStorage(key, initialValue) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        // If error also return initialValue
        console.log(error);
        return initialValue;
      }
    });
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    };
    return [storedValue, setValue];
}

/**
 * returns true if a valid playerId exists in localStorage, false else
 * @returns boolean
 */
 export function hasValidPlayerId(){
  const item= window.localStorage.getItem('playerId');
  const playerId = item ? JSON.parse(item) : null;
  return !!playerId;
}

/**
* returns the playerId stored in localStorage, empty else
* @returns string
*/
export function getPlayerId(){
  const item= window.localStorage.getItem('playerId');
  const playerId = item ? JSON.parse(item) : null;
  return playerId || "";
}

/**
* create a playerId, store it in locaStorage and returns it
* @returns string
*/
export function createPlayerId(){
  const playerId = `u_${uuidV4()}`;
  window.localStorage.setItem('playerId', JSON.stringify(playerId));
  return playerId;
}

/**
 * returns true if a valid playerName exists in localStorage, false else
 * @returns boolean
 */
export function hasValidPlayerName(){
    const item= window.localStorage.getItem('playerName');
    const playerName = item ? JSON.parse(item) : null;
    return playerName !== null && !!playerName && `${playerName}`.length >= 3;
}

/**
 * returns the playerName stored in localStorage, empty else
 * @returns string
 */
 export function getPlayerName(){
  const item= window.localStorage.getItem('playerName');
  const playerName = item ? JSON.parse(item) : null;
  return playerName || "";
}