// Création de la carte avec Leaflet
const map = L.map("map");

const nbSpawnPointsMobile = 5;
const nbSpawnPointsDesktop = 20;
const maxSpawnMobile = 3;
const maxSpawnDesktop = 6;
const nbSpawnPokestopMobile = 4;
const nbSpawnPokestopDesktop = 3;

let pokemonLayerGroups = [];
let pokestopLayerGroups = [];

// Variables pour la position actuelle de l'utilisateur
let lat = 0;
let long = 0;
let user = "";
let userMarker;
let sound = true;
let capturedPokemon = [];
let userBag;

// Par défaut on est sur ordinateur
let isMobile = false;

// Pop-Up règlement du jeu -> Fait disparaitre la pop-up connexion le temps d'accepter les règles
document.addEventListener("DOMContentLoaded", function () {
  const rulesPopUp = document.getElementById("rules-popup");
  const okButton = document.getElementById("rules-button");
  const connexionPopUp = document.getElementById("connexion");
  // Affiche d’abord les règles
  rulesPopUp.style.display = "flex";
  if (connexionPopUp) connexionPopUp.style.display = "none";

  okButton.addEventListener("click", () => {
    // Quand on clique sur OK :
    rulesPopUp.style.display = "none";
    if (connexionPopUp) connexionPopUp.style.display = "flex";
  });
});

// Fonction pour générer la carte
function generateMap() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
}

// Fonction pour obtenir la position actuelle de l'utilisateur
function getCurrentPostion() {
  navigator.geolocation.getCurrentPosition(onPosition);
}

// Fonction appelée quand la position de l'utilisateur est obtenue
function onPosition(position_obj) {
  lat = position_obj.coords.latitude;
  long = position_obj.coords.longitude;

  // On centre la carte sur la position de l'utilisateur
  showCurrentPosition();

  // Génère de nouveaux pokémon toutes les 5 secondes
  setInterval(createPokemons, 5000);

  createPokestops();

  // Met à jour la position du joueur
  navigator.geolocation.watchPosition(updatePosition);
}

// Pour afficher la position actuelle avec un zoom à 18
function showCurrentPosition() {
  map.setView([lat, long], 18);
}

// Met à jour la position du joueur quand il se déplace
function updatePosition(position_obj) {
  lat = position_obj.coords.latitude;
  long = position_obj.coords.longitude;

  createPlayer();
}

// Créer le joueur // A CHANGER POUR CHOISIR SON PERSONNAGE
function createPlayer() {
  const myIcon = L.icon({
    iconUrl: "assets/images/players/Roxanne_OD.png",
    iconSize: [50, 50],
  });

  // Si le marker de l'utilisateur existe déjà, on le met à jour
  if (userMarker) {
    userMarker.setLatLng([lat, long]);
  } else {
    // Sinon, on crée un nouveau marker
    userMarker = L.marker([lat, long], { icon: myIcon }).addTo(map);
  }

  map.setView([lat, long], map.getZoom(), {
    animate: true,
    duration: 0.5,
  });
}

//
function loadUserPokemons() {
  capturedPokemon = JSON.parse(localStorage.getItem("pokemons-" + user)) ?? [];
}

// 
function loadUserBag() {
  userBag = JSON.parse(localStorage.getItem("bag-" + user)) ?? {
    pokeball: 0,
    superball: 0,
    hyperball: 0,
  };
}

//
function saveUserPokemons() {
  localStorage.setItem("pokemons-" + user, JSON.stringify(capturedPokemon));
}

//
function saveUserBag() {
  localStorage.setItem("bag-" + user, JSON.stringify(userBag));
}


//
function createPokemons() {
  // Détermine combien de pokémon seront générés de manière aléatoire
  let spawnPoints;
  if (isMobile) {
    spawnPoints = Array.from(
      { length: Math.floor(Math.random() * maxSpawnMobile) },
      () => Math.floor(Math.random() * nbSpawnPointsMobile)
    );
  } else {
    spawnPoints = Array.from(
      { length: Math.floor(Math.random() * maxSpawnDesktop) },
      () => Math.floor(Math.random() * nbSpawnPointsDesktop)
    );
  }

  spawnPoints.forEach((layerNumber) => {
    let layer = pokemonLayerGroups[layerNumber];

    layer.clearLayers();

    if (Math.random() > 0.25) {
      const pokedexId = Math.floor(Math.random() * 898 + 1);

      fetch(`https://pokebuildapi.fr/api/v1/pokemon/${pokedexId}`)
        .then((response) => response.json())
        .then((pokemon) => {
          let myIcon;
          if (!isMobile) {
            myIcon = L.icon({
              iconUrl: pokemon.sprite,
              iconSize: [100, 100],
              iconAnchor: [50, 50],
              popupAnchor: [0, -30],
            });
          } else {
            myIcon = L.icon({
              iconUrl: pokemon.sprite,
              iconSize: [75, 75],
              iconAnchor: [37.5, 37.5],
              popupAnchor: [0, -30],
            });
          }

          let dividerWidth;
          let dividerHeight;
          if (isMobile) {
            dividerWidth = 600;
            dividerHeight = 2000;
          } else {
            dividerWidth = 800;
            dividerHeight = 300;
          }

          const marker = new L.marker(
            [
              Math.random() > 0.5
                ? lat + Math.random() / dividerWidth
                : lat - Math.random() / dividerWidth,
              Math.random() > 0.5
                ? long + Math.random() / dividerHeight
                : long - Math.random() / dividerHeight,
            ],
            { icon: myIcon }
          );

          marker.on("click", () => {
            showDetails(pokemon.pokedexId);
          });

          marker
            .bindPopup(
              `<div class="popup">
                <div id="popup-menu">
                  <img id="bag" src="assets/icons/bag.png">
                  <p>${pokemon.name}</p>
                  <img id="owned" src="${
                    capturedPokemon.some(
                      (p) => p.pokedexId === pokemon.pokedexId
                    )
                      ? "assets/icons/pokeball-rouge.svg"
                      : "assets/icons/pokeball-gray.svg"
                  }">
                </div>
                <div id="bag-menu" class="bag-hidden">
                  <div>
                    <img id="pokeball" data-layer="${layerNumber}" data-pokemon="${
                pokemon.pokedexId
              }" data-pokeball="pokeball" src="assets/icons/pokeball.png">
                    <p id="pokeball-nb"></p>
                  </div>
                  <div>
                    <img id="superball" data-layer="${layerNumber}" data-pokemon="${
                pokemon.pokedexId
              }" data-pokeball="superball" src="assets/icons/superball.png">
                    <p id="superball-nb"></p>
                  </div>
                  <div>
                    <img id="hyperball" data-layer="${layerNumber}" data-pokemon="${
                pokemon.pokedexId
              }" data-pokeball="hyperball" src="assets/icons/hyperball.png">
                    <p id="hyperball-nb"></p>
                  </div>
                </div>
              </div>`
            )
            .openPopup();

          layer.addLayer(marker);
          map.addLayer(layer);
        });
    }
  });
}

function createPokestops() {
  let spawnPoints;
  if (isMobile) {
    spawnPoints = [...Array(nbSpawnPokestopMobile).keys()];
  } else {
    spawnPoints = [...Array(nbSpawnPokestopDesktop).keys()];
  }

  spawnPoints.forEach((layerNumber) => {
    let layer = pokestopLayerGroups[layerNumber];
    layer.clearLayers();

    let myIcon;
    if (!isMobile) {
      myIcon = L.icon({
        iconUrl: "assets/icons/pokestop.png",
        iconSize: [75, 75],
        iconAnchor: [50, 50],
        popupAnchor: [0, -30],
      });
    } else {
      myIcon = L.icon({
        iconUrl: "assets/icons/pokestop.png",
        iconSize: [35, 35],
        iconAnchor: [37.5, 37.5],
        popupAnchor: [0, -30],
      });
    }

    let dividerWidth;
    let dividerHeight;
    if (isMobile) {
      dividerWidth = 600;
      dividerHeight = 2000;
    } else {
      dividerWidth = 800;
      dividerHeight = 300;
    }

    const marker = new L.marker(
      [
        Math.random() > 0.5
          ? lat + Math.random() / dividerWidth
          : lat - Math.random() / dividerWidth,
        Math.random() > 0.5
          ? long + Math.random() / dividerHeight
          : long - Math.random() / dividerHeight,
      ],
      { icon: myIcon }
    );

    marker.on("click", (e) => {
      if (!e.target._icon.src.includes("pokestop-used")) {
        userBag.pokeball = userBag.pokeball + 1 + Math.round(Math.random() * 2);
        userBag.superball = userBag.superball + Math.round(Math.random() * 2);
        userBag.hyperball = userBag.hyperball + Math.round(Math.random() * 2);

        let usedIcon;
        if (!isMobile) {
          usedIcon = L.icon({
            iconUrl: "assets/icons/pokestop-used.png",
            iconSize: [75, 75],
            iconAnchor: [50, 50],
            popupAnchor: [0, -30],
          });
        } else {
          usedIcon = L.icon({
            iconUrl: "assets/icons/pokestop-used.png",
            iconSize: [35, 35],
            iconAnchor: [37.5, 37.5],
            popupAnchor: [0, -30],
          });
        }

        e.target.setIcon(usedIcon);

        setTimeout(() => {
          e.target.setIcon(myIcon);
        }, 120000);

        saveUserBag();
      }
    });

    layer.addLayer(marker);
    map.addLayer(layer);
  });
}

function catchPokemon(pokemonId, layerId, pokeball) {
  let captured;
  let canCapture = false;

  switch (pokeball) {
    case "pokeball":
      captured = Math.random() > 0.75;
      canCapture = userBag.pokeball > 0;
      if (canCapture) userBag.pokeball--;
      break;
    case "superball":
      captured = Math.random() > 0.66;
      canCapture = userBag.superball > 0;
      if (canCapture) userBag.superball--;
      break;
    case "hyperball":
      captured = Math.random() > 0.5;
      canCapture = userBag.hyperball > 0;
      if (canCapture) userBag.hyperball--;
      break;
    default:
      canCapture = false;
      captured = false;
      break;
  }

  if (!canCapture) {
    return;
  }

  saveUserBag();

  if (captured) {
    // Si capturé, on ajoute le pokémon au tableau des pokémon capturés (localStorage)
    capturedPokemon.push({
      id: crypto.randomUUID(),
      pokedexId: pokemonId,
      date: new Date(),
    });

    saveUserPokemons();

    // Affichage du pokédex avec infos SI capturé
    const capture = document.getElementById("capture");
    capture.classList.remove("capture-hidden");

    // Condition pour fermer le pokédex automatiquement en responsive
    if (window.matchMedia("(max-width: 810px)").matches) {
      setTimeout(() => {
        capture.classList.add("capture-hidden");
      }, 2000);
    }
  } else {
    const escapePopup = document.getElementById("escape-popup");
    escapePopup.classList.remove("escape-hidden");
    setTimeout(() => {
      escapePopup.classList.add("escape-hidden");
    }, 1000);
  }

  // Fais disparaitre le pokémon
  const layer = pokemonLayerGroups[layerId];
  layer.clearLayers();
}

function showDetails(pokemonId, isPokedex, id) {
  let prefix;
  if (isPokedex) {
    prefix = "pokedex-";
  } else {
    prefix = "capture-";
  }
  const detail = document.getElementById(prefix + "detail");
  detail.innerHTML = "";

  fetch(`https://pokebuildapi.fr/api/v1/pokemon/${pokemonId}`)
    .then((response) => response.json())
    .then((pokemon) => {
      if (!isPokedex) {
        detail.innerHTML += '<h3 class="catch">Pokémon capturé !</h3>';
      }

      detail.innerHTML += `
        <div class="pokeDetail">
        <p class="number">n°${pokemon.pokedexId}</p>
        <img class="picture" src="${pokemon.image}">
        <h2 class="name">${pokemon.name}</h2>
        </div>
        <div class="types">
          <p>Type${pokemon.apiTypes.length > 1 ? "s" : ""}</p>
          <div id="${prefix}types"></div>
        </div>
        `;

      const types = document.getElementById(prefix + "types");
      pokemon.apiTypes.forEach(function (type) {
        types.innerHTML += `<img class="type" src="${type.image}">`;
      });

      const evolutionDiv = document.getElementById(prefix + "evolution");

      let evolutionCount = 0;
      evolutionDiv.innerHTML = "";
      pokemon.apiEvolutions.forEach((evolution) => {
        fetch(`https://pokebuildapi.fr/api/v1/pokemon/${evolution.pokedexId}`)
          .then((response) => response.json())
          .then((pokemonEvolution) => {
            if (pokemonEvolution) {
              if (evolutionCount == 0) {
                evolutionDiv.innerHTML = `<p>Evolution${
                  pokemon.apiEvolutions.length > 1 ? "s" : ""
                }</p>`;
              }

              let pokemonDiv = document.createElement("div");
              pokemonDiv.id = `show-evol-${pokemonEvolution.pokedexId}`;
              pokemonDiv.className = "pokemon";
              pokemonDiv.innerHTML = `
              <div class="evolDetail">
              <p>${pokemonEvolution.pokedexId}.</p>
              <p>${pokemonEvolution.name}<p>
              </div>
              <img src="${pokemonEvolution.image}">`;

              evolutionDiv.appendChild(pokemonDiv);
              evolutionCount++;
            }
          });
      });

      if (isPokedex && id) {
        releasePokemon(id, pokemon.name);
      }
    });
}

function releasePokemon(id, name) {
  const release = document.getElementById("release");
  release.addEventListener("click", () => {
    const message = document.getElementById("pokedex-release-message");
    message.innerHTML = `Etes-vous sûr de vouloir relâcher <strong> ${name} </strong> ?`;

    const confirm = document.getElementById("pokedex-release");
    confirm.classList.remove("pokedex-release-hidden");

    const confirmYes = document.getElementById("pokedex-release-yes");
    confirmYes.addEventListener("click", () => {
      capturedPokemon = capturedPokemon.filter((p) => p.id != id);
      saveUserPokemons();
      confirm.classList.add("pokedex-release-hidden");
      const pokedex = document.getElementById("pokedex");
      pokedex.classList.add("pokedex-hidden");

      const computerPopup = document.getElementById("computer-popup");
      computerPopup.classList.remove("computer-hidden");
      loadComputerList();
    });

    const confirmNo = document.getElementById("pokedex-release-no");
    confirmNo.addEventListener("click", () => {
      confirm.classList.add("pokedex-release-hidden");
    });
  });
}

function initPage() {
  // Init Pokemon et Pokédex layers
  if (isMobile) {
    for (let i = 0; i < nbSpawnPointsMobile; i++) {
      pokemonLayerGroups.push(L.layerGroup());
    }
    for (let i = 0; i < nbSpawnPokestopMobile; i++) {
      pokestopLayerGroups.push(L.layerGroup());
    }
  } else {
    for (let i = 0; i < nbSpawnPointsDesktop; i++) {
      pokemonLayerGroups.push(L.layerGroup());
    }
    for (let i = 0; i < nbSpawnPokestopDesktop; i++) {
      pokestopLayerGroups.push(L.layerGroup());
    }
  }

  map.on("popupopen", () => {
    const capture = document.getElementById("capture");
    capture.classList.add("capture-hidden");

    const bags = document.querySelectorAll("#bag");
    bags.forEach((bag) => {
      bag.addEventListener("click", () => {
        const bagMenu = document.getElementById("bag-menu");
        bagMenu.classList.remove("bag-hidden");
        const menu = document.getElementById("popup-menu");
        menu.classList.add("menu-hidden");
      });

      let balls = [];
      const pokeballs = document.querySelectorAll("#pokeball");
      pokeballs.forEach((b) => balls.push(b));
      const superballs = document.querySelectorAll("#superball");
      superballs.forEach((b) => balls.push(b));
      const hyperballs = document.querySelectorAll("#hyperball");
      hyperballs.forEach((b) => balls.push(b));
      const nbPokeballs = document.querySelectorAll("#pokeball-nb");
      nbPokeballs.forEach((b) => (b.innerHTML = userBag.pokeball));
      const nbSuperballs = document.querySelectorAll("#superball-nb");
      nbSuperballs.forEach((b) => (b.innerHTML = userBag.superball));
      const nbHyperballs = document.querySelectorAll("#hyperball-nb");
      nbHyperballs.forEach((b) => (b.innerHTML = userBag.hyperball));

      balls.forEach((b) => {
        const pokemonId = Number(b.dataset.pokemon);
        const layerId = Number(b.dataset.layer);
        const pokeballType = b.dataset.pokeball;
        b.addEventListener("click", () => {
          catchPokemon(pokemonId, layerId, pokeballType);
        });
      });
    });
  });

  const captureClose = document.getElementById("capture-close");
  captureClose.addEventListener("click", () => {
    const capture = document.getElementById("capture");
    capture.classList.add("capture-hidden");
  });

  const pokedexClose = document.getElementById("pokedex-close");
  pokedexClose.addEventListener("click", () => {
    const pokedex = document.getElementById("pokedex");
    pokedex.classList.add("pokedex-hidden");
    const computerPopup = document.getElementById("computer-popup");
    computerPopup.classList.remove("computer-hidden");
  });

  const userForm = document.getElementById("user-form");
  userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    user = userForm[0].value.trim().toLowerCase();

    const popup = document.getElementById("connexion");
    popup.classList.add("connexion-hide");

    loadUserPokemons();
    loadUserBag();
  });

  // Musique d'ambiance en fond, lecture automatique avec possibilité de mettre en pause
  const backgroundMusic = document.getElementById("background-music");
  const soundButton = document.getElementById("sound");
  soundButton.addEventListener("click", () => {
    if (sound) {
      sound = false;
      soundButton.children[0].src = "assets/icons/Mute_Icon.svg";
      backgroundMusic.pause();
    } else {
      sound = true;
      soundButton.children[0].src = "assets/icons/Speaker_Icon.svg";
      backgroundMusic.play();
    }
  });

  // Boutons liés au computer
  const computerButton = document.getElementById("computer");

  // Ouvrir le computer
  computerButton.addEventListener("click", () => {
    const capturedList = document.getElementById("captured-list");
    // Récupère les pokémon du localStorage
    capturedList.innerHTML = "";

    const computerPopup = document.getElementById("computer-popup");
    if (capturedPokemon.length == 0) {
      computerPopup.innerHTML +=
        "<div class='message'><p>Aucun pokémon capturé pour le moment.</p></div>";
    } else {
      loadComputerList();
    }

    computerPopup.classList.remove("computer-hidden");
    const capture = document.getElementById("capture");
    capture.classList.add("capture-hidden");

    // Fermer le PC Pokémon
    const closeComputer = document.getElementById("close-computer");
    closeComputer.addEventListener("click", () => {
      console.log("ça passe");
      computerPopup.classList.add("computer-hidden");
    });
  });
}

function loadComputerList() {
  const capturedList = document.getElementById("captured-list");
  capturedList.innerHTML = "";

  // Du plus récent au plus ancien
  const sortByDate = capturedPokemon.sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date)
  );
  sortByDate.forEach((p) => {
    loadComputer(p);
  });
}

function loadComputer(p) {
  const div = document.createElement("div");
  div.className = "captured-pokemon";
  div.innerHTML = `
            <img id="img-${p.id}">
            <div>
              <p id="name-${p.id}"></p>
            </div>
            `;
  const capturedList = document.getElementById("captured-list");
  capturedList.appendChild(div);

  div.addEventListener("click", () => {
    const computerPopup = document.getElementById("computer-popup");
    computerPopup.classList.add("computer-hidden");
    const pokedex = document.getElementById("pokedex");
    pokedex.classList.remove("pokedex-hidden");

    showDetails(p.pokedexId, true, p.id);
  });

  fetch(`https://pokebuildapi.fr/api/v1/pokemon/${p.pokedexId}`)
    .then((response) => response.json())
    .then((pokemon) => {
      const img = document.getElementById("img-" + p.id);
      img.src = pokemon.image;
      const name = document.getElementById("name-" + p.id);
      name.innerText = pokemon.name;
    });
}

// Définit à quel moment on est sur mobile
function getMobileType() {
  const screenwidth = window.screen.width;
  if (screenwidth < 1200) {
    isMobile = true;
  }
}

// Bouton pour recentrer la map sur l'utilisateur
function initGeolocationButton() {
  const geolocationButton = document.getElementById("geolocation");
  geolocationButton.addEventListener("click", showCurrentPosition);
}

getMobileType();
generateMap();
initGeolocationButton();
initPage();
getCurrentPostion();
