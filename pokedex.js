"use strict";

window.addEventListener("load", onLoad);

async function onLoad() {
  const NAMES_LIST = await getNamesList();
  appendSprites(NAMES_LIST);
}

/**
 * Calls the function below to get names of all 151 pokemon
 * Then splits them by line returning a list of Type: Name
 * for each of the pokemon
 * @returns {List} list of 151 values
 */
async function getNamesList() {
  const NAMES = await fetchNames();
  const NAMES_LIST = NAMES.split("\n");
  return NAMES_LIST;
}

/**
 * Gets called in function above to retrieve names of all 151 pokemon
 * @returns {Text Object} response from fetch request to names endpoint
 */
async function fetchNames() {
  try {
    const NAMES = await fetch('https://courses.cs.washington.edu/' +
    'courses/cse154/webservices/pokedex/pokedex.php?pokedex=all');

    await statusCheck(NAMES);
    const NAMES_TEXT = await NAMES.text();
    return NAMES_TEXT;
  } catch(error) {
    handlError(error);
  }
}

/**
 * Given to us in lecture
 * Checks to see if the connection status is successfull (200 Response Code)
 * If so, does nothing and continues through res of the code.
 * Otherwise, throws an error and kills the program.
 * @param {object} res - response from get request
 * @returns {object} same as input
 */
 async function statusCheck(res) {
  if (!res.ok) {
   throw new Error(await res.test());
  }

  return res;
}

/**
 * Takes in a list of the names of all 151 pokemon and uses it to locate the image
 * endpoint by appending to the standard url along with .png at the end
 * Creates a document element of the picture with the source and appends them to the
 * poke-dex-view section which displays all the pokemon
 * all of them except bulbasaur, charmander, and squirtle are given the class 'sprite'
 * which means they have not been found yet and are colored in black
 * @param {List of String} NAMES_LIST 
 */
async function appendSprites(NAMES_LIST) {
  const POKE_DEX_VIEW = document.getElementById('pokedex-view');
  for(let i = 0; i < NAMES_LIST.length; i++) {
    let name_elements = NAMES_LIST[i].split(":");
    let name = name_elements[1];
    let endpoint = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/sprites/';
    endpoint += name;
    endpoint += '.png';

    let image = document.createElement("img");
    if(name === 'bulbasaur' || name === 'charmander' || name === 'squirtle') {
      image.classList.add('found');
    } else {
      image.classList.add('sprite');
    }
    image.src = endpoint;
    let id = 'pokemon-' + name;
    image.id = id;
    POKE_DEX_VIEW.appendChild(image);
  }
}

function handlError(error) {

}