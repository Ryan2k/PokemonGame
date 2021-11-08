"use strict";

const ENDPOINT = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/';

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
 * @returns {Object} response from fetch request to names endpoint
 */
async function fetchNames() {
  try {
    const NAMES = await fetch(ENDPOINT + 'pokedex.php?pokedex=all');

    await statusCheck(NAMES);
    const NAMES_TEXT = await NAMES.text();
    return NAMES_TEXT;
  } catch (error) {
    handlError(error);
  }
}

/**
 * Takes in a list of the names of all 151 pokemon and uses it to locate the image
 * endpoint by appending to the standard url along with .png at the end
 * Creates a document element of the picture with the source and appends them to the
 * poke-dex-view section which displays all the pokemon
 * all of them except bulbasaur, charmander, and squirtle are given the class 'sprite'
 * which means they have not been found yet and are colored in black
 * @param {Array} NAMES_LIST - list of all the pokemons names
 */
function appendSprites(NAMES_LIST) {
  const POKE_DEX_VIEW = document.getElementById('pokedex-view');
  for (let i = 0; i < NAMES_LIST.length; i++) {
    let nameElements = NAMES_LIST[i].split(":");
    let name = nameElements[1];
    let imgEndPoint = ENDPOINT + 'sprites/' + name + '.png';

    let image = document.createElement("img");
    if (name === 'bulbasaur' || name === 'charmander' || name === 'squirtle') {
      image.classList.add('found');
      image.addEventListener("click", onCardClick);
    }

    image.classList.add('sprite');

    image.src = imgEndPoint;
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

  setName(name, 'p1');
  setMoves(CARDS_JSON, 'p1');
  setOthers(CARDS_JSON, 'p1');

  const START_BUTTON = document.getElementById('start-btn');
  START_BUTTON.classList.remove('hidden');
  START_BUTTON.addEventListener("click", function() {
    startGame(name);
  });
}

/**
 * Take in the name of the pokemon that was clicked on and sends a
 * GET request to the endpoint which contains information on that pokemon
 * such as its name, attributes, icon image, etc.
 * @param {String} name - name of the pokemon
 * @returns {Object} json object from description
 */
async function getPokemonsJSON(name) {
  let endpoint = ENDPOINT + 'pokedex.php?pokemon=';
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

/**
 * Takes the name of the pokemon, makes the first letter uppercase, and
 * appends it to the corresponding card on the html
 * (#p1 .name if called in onClick and #p2 .name if opponent)
 * @param {String} name - name of the pokemon we are querying
 * @param {String} player - p1 or p2 depending on who called it
 */
function setName(name, player) {
  let nameQuery;
  if (player === 'p1') {
    nameQuery = '#p1 .name';
  } else {
    nameQuery = '#p2 .name';
  }
  const PLAYER1_NAME = document.querySelector(nameQuery);
  const NAME_TEXT = name.substring(0, 1).toUpperCase() + name.substring(1);
  const NAME_TEXT_NODE = document.createTextNode(NAME_TEXT);
  PLAYER1_NAME.removeChild(PLAYER1_NAME.firstChild);
  PLAYER1_NAME.appendChild(NAME_TEXT_NODE);
}

/**
 * Loops through the size of the moves array in the JSON object and appends all
 * of the text and images to the corresponding divs in the html. query is different
 * depending on whether this function was called on the onClick or the random opponent.
 * @param {Object} CARDS_JSON - JSON Object representing current pokemons info
 * @param {String} player - either p1 or p2 depending on who called it
 */
function setMoves(CARDS_JSON, player) {
  let movesQuery;
  let imageQuery;
  let dpQuery;
  let buttonQuery;

  if (player === 'p1') {
    movesQuery = '#p1 .move';
    imageQuery = '#p1 .moves img';
    dpQuery = '#p1 .dp';
    buttonQuery = '#p1 button';
  } else {
    movesQuery = '#p2 .move';
    imageQuery = '#p2 .moves img';
    dpQuery = '#p2 .dp';
    buttonQuery = '#p2 button';
  }

  const MOVES = CARDS_JSON.moves;
  const MOVES_HTML_ELEMENT = document.querySelectorAll(movesQuery);
  const IMAGES = document.querySelectorAll(imageQuery);
  const DPARRAY = document.querySelectorAll(dpQuery);
  const BUTTONS = document.querySelectorAll(buttonQuery);

  appendMoves(MOVES_HTML_ELEMENT, MOVES, DPARRAY, BUTTONS, IMAGES);
}

/**
 * Helper for function above. Takes in the queried elements and appends
 * the names of the moves to the queried divs, images to the images, DP
 * to DP div if existant, and finally removes any extra buttons as the
 * default is four but we only need as many as there are moves
 * @param {DOM} MOVES_HTML_ELEMENT - all the html elements with the moves class
 * @param {JSON} MOVES - JSON Array of moves
 * @param {DOM} DPARRAY - All the DP doms
 * @param {DOM} BUTTONS - all the buttons DOMS
 * @param {JSON} IMAGES - JSON object with image links
 */
function appendMoves(MOVES_HTML_ELEMENT, MOVES, DPARRAY, BUTTONS, IMAGES) {
  let i = 0;

  for (let j = 0; j < MOVES.length; j++) {
    MOVES_HTML_ELEMENT[i].innerHTML = MOVES[i].name;
    IMAGES[i].src = ENDPOINT + 'icons/' + MOVES[i].type + '.jpg';

    // remove any existing dp if has one otherwise leaves 'dp' if clicked another character
    if (DPARRAY[i].hasChildNodes()) {
      DPARRAY[i].removeChild(DPARRAY[i].firstChild);
    }

    // checks to see if the moves at this position in the array has a key called "dp"
    if (MOVES[i].hasOwnProperty("dp")) {
      let dpTextNode = document.createTextNode(MOVES[i].dp + ' DP');
      DPARRAY[i].appendChild(dpTextNode);
    }
    i++;
  }


  for (let j = i; j < MOVES_HTML_ELEMENT.length; j++) {
    BUTTONS[i].classList.add('hidden');
  }
}

/**
 * Sets the remaining attributes for a card icon:
 * The pokemon photo, weakness photo, type icon, description, and health points
 * Just like the functions above, takes in the JSON object for the card it
 * will append the elements to, and the name of the player since there are two cards
 * in the HTML. Then appends them to the below HTML ELements.
 * @param {Object} CARDS_JSON - JSON Object containing information about the specified pokemon
 * @param {String} player - p1 or p2 depending on who called it.
 */
function setOthers(CARDS_JSON, player) {
  let pokepicQuery;
  let weaknessQuery;
  let descriptionQuery;
  let hpQuery;
  let typeIconQuery;

  if (player === 'p1') {
    pokepicQuery = '#p1 .pokepic';
    weaknessQuery = '#p1  .weakness';
    descriptionQuery = '#p1 .info';
    hpQuery = '#p1 .hp';
    typeIconQuery = '#p1 .type';
  } else {
    pokepicQuery = '#p2 .pokepic';
    weaknessQuery = '#p2  .weakness';
    descriptionQuery = '#p2 .info';
    hpQuery = '#p2 .hp';
    typeIconQuery = '#p2 .type';
  }

  const POKEPIC = document.querySelector(pokepicQuery);
  const WEAKNESS = document.querySelector(weaknessQuery);
  const DESCRIPTION = document.querySelector(descriptionQuery);
  const HP = document.querySelector(hpQuery);
  const TYPEICON = document.querySelector(typeIconQuery);

  const IMAGES = CARDS_JSON.images;

  POKEPIC.src = ENDPOINT + IMAGES.photo;
  WEAKNESS.src = ENDPOINT + IMAGES.weaknessIcon;
  TYPEICON.src = ENDPOINT + IMAGES.typeIcon;
  DESCRIPTION.innerHTML = CARDS_JSON.info.description;
  HP.innerHTML = CARDS_JSON.hp + 'HP';
}

async function startGame(name) {
  // hide pokedex-view which shows selected pokemon
  const POKE_DEX_VIEW = document.getElementById('pokedex-view');
  POKE_DEX_VIEW.classList.add('hidden');

  // make the second players card visible
  const P2 = document.getElementById('p2');
  P2.classList.remove('hidden');

  // populate second players card
  const GAME_JSON = await getStartGameData(name);
  const P2_CARD_JSON = GAME_JSON.p2;
  setPlayer2Card(P2_CARD_JSON);
  toGameView();
}

/**
 * Sends a post request to get initial game state information such as,
 * the game id, the player id, the moves each player took, and player 2's random character
 * To send the post request need to set 2 parameters:
 * 1. stargame=true
 * 2. mypokemon=<the name of the selected pokemon>
 * Similar to get request but have to specify that it is a post, and give it the body
 * of key value pairs in the form of a FormData object
 * @param {String} name - name of the current pokemon we have chosen
 * @returns {Object} - JSON for the game data including a nested JSON with player 2's info
 */
async function getStartGameData(name) {
  const GAME_ENDPOINT = ENDPOINT + 'game.php';
  let params = new FormData();
  params.append('startgame', true);
  params.append('mypokemon', name);

  try {
    const RESPONSE = await fetch(GAME_ENDPOINT, {
      method: 'POST',
      body: params
    });

    await statusCheck(RESPONSE);
    const JSON = await RESPONSE.json();
    return JSON;
  } catch (error) {
    handlError(error);
  }
}

/**
 * Takes in the JSON data from the above call and selects the nested JSON of p2.
 * p2 is randomly generated by the server and has a set of moves, name, images, etc.
 * Just like the information got from the player one card, and calls those same functions
 * just specifying p2 as a parameter so it gets appended to the div labeled p2 for the card
 * in the html file.
 * @param {Object} P2_CARD_JSON - JSON object with the second players data (nested from above call)
 */
async function setPlayer2Card(P2_CARD_JSON) {
  const name = P2_CARD_JSON.name;

  setName(name, 'p2');
  setMoves(P2_CARD_JSON, 'p2');
  setOthers(P2_CARD_JSON, 'p2');
}

/**
 * This function takes a few steps to change to the game view by
 * manipulating some of the css classes such as:
 * 1. Makes #result-container visible which populates center of page with moves
 * 2. Shows #flee-btn underneath #p1
 * 3. Hides the start button again
 * 4. Enables all of the visible move buttons for #p1. The pokedex.html comes
 * with these buttons disabled by defualt so we set this attribute to false to disable
 * and can re-enable it by setting the attribute to true;
 * 5. Show pokemons hp bar by removing the hidden class from .hp-info
 * 6. Change the text in the header from "Your Pokedex" to "Pokemon Battle!"
 */
function toGameView() {
  const RESULTS_CONTAINER = document.getElementById('results-container');
  const P1_FLEE_BTN = document.getElementById('flee-btn'); // only exists for p1, no need to query
  const START_BUTTON = document.getElementById('start-btn');
  const HP_INFO = document.querySelector('.hidden.hp-info');
  const HEADER_H1 = document.querySelector('h1'); // only one h1 in entire html

  RESULTS_CONTAINER.classList.remove('hidden');
  P1_FLEE_BTN.classList.remove('hidden');
  START_BUTTON.classList.add('hidden'); // we have removed the hidden class in an above function
  HP_INFO.classList.remove('hidden');
  HEADER_H1.innerHTML = 'Pokemon Battle!';

  const P1_MOVES = document.querySelectorAll('#p1 .card button');
  for (let i = 0; i < P1_MOVES.length; i++) {
    if (P1_MOVES[i].classList.contains('hidden')) {
      continue;
    }

    P1_MOVES[i].disabled = false;
  }
}

function handlError(error) {

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