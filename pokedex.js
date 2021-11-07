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
  } catch (error) {
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
 * @param {List of String} NAMES_LIST - list of all the pokemons names
 */
function appendSprites(NAMES_LIST) {
  const POKE_DEX_VIEW = document.getElementById('pokedex-view');
  for (let i = 0; i < NAMES_LIST.length; i++) {
    let nameElements = NAMES_LIST[i].split(":");
    let name = nameElements[1];
    let endpoint = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/sprites/';
    endpoint += name;
    endpoint += '.png';

    let image = document.createElement("img");
    if (name === 'bulbasaur' || name === 'charmander' || name === 'squirtle') {
      image.classList.add('found');
      image.addEventListener("click", onCardClick);
    }

    image.classList.add('sprite');

    image.src = endpoint;
    let id = 'pokemon-' + name;
    image.id = id;
    POKE_DEX_VIEW.appendChild(image);
  }
}

/**
 * Called when a found item is clicked on. Attached when a item is declared
 * as found. When the item is clicked, it calls the function below which
 * pings the endpoint to gather information on the pokemon. That information
 * is used to change the elements displayed on the left of the screen from
 * the default values to the name, attributes, and photo of the clicked pokemon.
 */
async function onCardClick() {
  let id = this.id;
  let nameElements = id.split("-");
  let name = nameElements[1];
  
  const CARDS_JSON = await getPokemonsJSON(name);
  
}

/**
 * Take in the name of the pokemon that was clicked on and sends a
 * GET request to the endpoint which contains information on that pokemon
 * such as its name, attributes, icon image, etc.
 * @param {String} name - name of the pokemon
 * @returns {Object} json object from description
 */
async function getPokemonsJSON(name) {
  let endpoint = 'https://courses.cs.washington.edu/'
  + 'courses/cse154/webservices/pokedex/pokedex.php?pokemon=';
  endpoint += name;

  try {
    const RESPONSE = await fetch(endpoint);
    await statusCheck(RESPONSE);
    const JSON = await RESPONSE.json();
    return JSON;
  } catch (error) {
    handlError(error);
  }
}

function handlError(error) {

}