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
    handleError(error);
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
    handleError(error);
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

/**
 * Called in an anonymous function when the start-btn is pressed.
 * Enables all the functionalities needed to get from the pokedex view to the
 * start of the game. First hides the pokedex-view which displays all the pokemon,
 * then un hides the html for the second players card.
 * Calls a function to get the json for the start of the game (explained below),
 * then calls a function to enables all of the attributes that are hidden when
 * we are in the pokedex view (explained above toGameView() function)
 * Finally, calls a function to set event listeners for player 1's moves
 * which correspond to in game moves and make API Calls. Could not set this originally
 * because when the game wasnt started, we dont want functionality
 * @param {*} name 
 */
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

  const P1_MOVES = GAME_JSON.p1.moves;
  const GUID = GAME_JSON.guid;
  const PID = GAME_JSON.pid;
  setMovesListeners(P1_MOVES, GUID, PID);
}

/**
 * Helper function for start game above. Job is to set event listeners to all
 * of the active move buttons for p1. Gets all divs under p1 .moves and attaches
 * a listener so that when it is clicked, makes a call to the game.php API and
 * recieves a randomly generated move from p2 along with the results of each of
 * our moves. To make the call, its a POST needing parameters of movename, guid, and pid
 * @param {Object} P1_MOVES - JSON array with all the moves names and types
 * @param {String} GUID - String containing the game id
 * @param {String} PID - string containing the player id
 */
function setMovesListeners(P1_MOVES, GUID, PID) {
  const MOVES = document.querySelectorAll('#p1 button');
  for (let i = 0; i < P1_MOVES.length; i++) {
    MOVES[i].addEventListener("click", function() {
      makeMove(P1_MOVES[i].name, GUID, PID);
    })
  }
}

/**
 * Function to make move added to each move button as an event listener in the function above.
 * Takes in the name of the move, the game id, and the player id which are requred to
 * send a POST request gathering the new game state in the function 1 below.
 * Then calls 2 additional functions which append the results to the screen and update the
 * health and health bar of each player. Descriptions are above those respective functions
 * @param {String} moveName - name of the move we (p1) are trying to make
 * @param {String} guid - the game id (needed to track the state of a game)
 * @param {String} pid - the player id
 */
async function makeMove(moveName, guid, pid) {
  const MOVE_RESULTS = await getMoveResults(moveName, guid, pid);
  appendResults(MOVE_RESULTS.results);
  updateHealth(MOVE_RESULTS);
}

/**
 * Helper method for the function above. Takes in the name of a move, the game id,
 * and the player id which are the parameters needed to send a POST request to
 * the game.php API inorder to "play a move". Returns a JSON document contianing the
 * same information before about the guid, pid, p1, and p2, but this time, has an
 * additional nested json object called "results" which contains the name of the move
 * we pass in, the randomly generated opponent move, and whether or not each move hit or missed.
 * @param {String} moveName - name of the move we are playing
 * @param {String} guid - the game id
 * @param {String} pid - the player id
 * @returns {Object} - the whole JSON returned by the request not just results
 */
async function getMoveResults(moveName, guid, pid) {
  let moveNameElements = moveName.split(" ");
  let apiReadyMoveName = '';
  for (let i = 0; i < moveNameElements.length; i++) {
    apiReadyMoveName += moveNameElements[i];
  }

  apiReadyMoveName = apiReadyMoveName.toLowerCase();

  let params = new FormData();
  params.append('guid', guid);
  params.append('pid', pid);
  params.append('movename', apiReadyMoveName);

  try {
    const RESPONSE = await fetch(ENDPOINT + 'game.php', {
      method: 'POST',
      body: params
    })

    await statusCheck(RESPONSE);
    const JSON = await RESPONSE.json();
    return JSON;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Helper function for the makeMove() method. Takes in the nested JSON from the
 * response to the post request from the game.php api containing 4 keyval pairs
 * the move each player played, and the result. Grabs the turn results elements from
 * the html and changes the text in them to display the moves.
 * Used resultsJSON["p1-move"] as resultsJSON.p1-move wont work since there is a hyphen
 * @param {Object} resultsJSON - nested JSON with the 4 vals from above
 */
function appendResults(resultsJSON) {
  const P1_TURN_RESULTS = document.getElementById('p1-turn-results');
  const P2_TURN_RESULTS = document.getElementById('p2-turn-results');

  const P1_TEXT = 'Player 1 played ' + resultsJSON["p1-move"] + ' and ' + resultsJSON["p1-result"] + '!';
  const P2_TEXT = 'Player 2 played ' + resultsJSON["p2-move"] + ' and ' + resultsJSON["p2-result"] + '!';

  P1_TURN_RESULTS.innerHTML = P1_TEXT;
  P2_TURN_RESULTS.innerHTML = P2_TEXT;
}

/**
 * Helper for the make move function to update the health of both players.
 * Has a Few Purposes
 * 1. Update the displayed health with the current health for each player
 * 2. Update the health bar under the .health-bar div on each card to make its width
 * a percentage of the max width where percentage is calculated as (current-hp / hp)
 * 3. If the percentage is below 20, should add the .low-health class to the health bar
 * @param {Object} gameJSON 
 */
function updateHealth(gameJSON) {
  const P1_HEALTH_BAR = document.querySelector('#p1 .health-bar');
  const P2_HEALTH_BAR = document.querySelector('#p2 .health-bar');

  const P1_CURRENT_HP = gameJSON.p1["current-hp"];
  const P2_CURRENT_HP = gameJSON.p2["current-hp"];

  const P1_HEALTH_PERCENTAGE = P1_CURRENT_HP / gameJSON.p1.hp;
  const P2_HEALTH_PERCENTAGE = P2_CURRENT_HP / gameJSON.p2.hp;

  P1_HEALTH_BAR.style.width = (P1_HEALTH_PERCENTAGE * 100) + '%';
  P2_HEALTH_BAR.style.width = (P2_HEALTH_PERCENTAGE * 100) + '%';

  if (P1_HEALTH_PERCENTAGE < .2) {
    P1_HEALTH_BAR.classList.add('low-health');
  }

  if (P2_HEALTH_PERCENTAGE < .2) {
    P2_HEALTH_BAR.classList.add('low-health');
  }

  const P1_HP = document.querySelector('#p1 .hp');
  const P2_HP = document.querySelector('#p2 .hp');

  P1_HP.innerHTML = P1_CURRENT_HP + 'HP';
  P2_HP.innerHTML = P2_CURRENT_HP + 'HP';

  console.log(gameJSON);
  console.log('player 1 current health: ' + P1_CURRENT_HP + ' player 1 start health: ' + gameJSON.p1.hp + ' percentage: ' + P1_HEALTH_PERCENTAGE);
  console.log('player 2 current health: ' + P2_CURRENT_HP + ' player 2 start health: ' + gameJSON.p2.hp + ' percentage: ' + P2_HEALTH_PERCENTAGE);
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
    handleError(error);
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
function setPlayer2Card(P2_CARD_JSON) {
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
    if (!P1_MOVES[i].classList.contains('hidden')) {
      P1_MOVES[i].disabled = false;
    }
  }

  // also have to unhide p1 and p2 results container because they are hidden for some reason

  const P1_TURN_RESULTS = document.getElementById('p1-turn-results');
  const P2_TURN_RESULTS = document.getElementById('p2-turn-results');

  P1_TURN_RESULTS.classList.remove('hidden');
  P2_TURN_RESULTS.classList.remove('hidden');
}

function handleError(error) {

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