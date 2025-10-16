
// Création de la carte avec Leaflet
const map = L.map("map");

let layerGroupPokemon1 = L.layerGroup();
let layerGroupPokemon2 = L.layerGroup();
let layerGroupPokemon3 = L.layerGroup();
let layerGroupPokemon4 = L.layerGroup();
let layerGroupPokemon5 = L.layerGroup();
let layerGroupPokemon6 = L.layerGroup();
let layerGroupPokemon7 = L.layerGroup();
let layerGroupPokemon8 = L.layerGroup();
let layerGroupPokemon9 = L.layerGroup();
let layerGroupPokemon10 = L.layerGroup();
let layerGroupPokemon11 = L.layerGroup();
let layerGroupPokemon12 = L.layerGroup();
let layerGroupPokemon13 = L.layerGroup();
let layerGroupPokemon14 = L.layerGroup();
let layerGroupPokemon15 = L.layerGroup();
let layerGroupPokemon16 = L.layerGroup();
let layerGroupPokemon17 = L.layerGroup();
let layerGroupPokemon18 = L.layerGroup();
let layerGroupPokemon19 = L.layerGroup();
let layerGroupPokemon20 = L.layerGroup();

// Variables pour la position actuelle de l'utilisateur
let lat = 0;
let long = 0;
let user = "";
let sound = true;

let capturedPokemon = [];

function getLayer(layerNumber) {
  switch (layerNumber) {
    case 1:
      return layerGroupPokemon1;
    case 2:
      return layerGroupPokemon2;
    case 3:
      return layerGroupPokemon3;
    case 4:
      return layerGroupPokemon4;
    case 5:
      return layerGroupPokemon5;
    case 6:
      return layerGroupPokemon6;
    case 7:
      return layerGroupPokemon7;
    case 8:
      return layerGroupPokemon8;
    case 9:
      return layerGroupPokemon9;
    case 10:
      return layerGroupPokemon10;
    case 11:
      return layerGroupPokemon11;
    case 12:
      return layerGroupPokemon12;
    case 13:
      return layerGroupPokemon13;
    case 14:
      return layerGroupPokemon14;
    case 15:
      return layerGroupPokemon15;
    case 16:
      return layerGroupPokemon16;
    case 17:
      return layerGroupPokemon17;
    case 18:
      return layerGroupPokemon18;
    case 19:
      return layerGroupPokemon19;
    case 20:
      return layerGroupPokemon20;
  }
}

// Fonction pour générer la carte
function generateMap() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
}

// Fonction pour obtenir la position actuelle de l'utilisateur
function getPostion() {
  navigator.geolocation.getCurrentPosition(onPosition);
  // On pourrait aussi utiliser cette méthode pour surveiller la position en temps réel :
  //navigator.geolocation.watchPosition(onPosition,null,{enableHighAccuracy:true});
}

// Fonction appelée quand la position de l'utilisateur est obtenue
function onPosition(position_obj) {
  lat = position_obj.coords.latitude;
  long = position_obj.coords.longitude;
  console.log(lat, long);

  // Bouton pour recentrer la map sur l'utilisateur
  const geolocationButton = document.getElementById("geolocation");
  geolocationButton.addEventListener("click", showCurrentPosition);

  // Indicateur de la position de l'utilisateur
  const marker = L.marker([lat, long]);
  marker.addTo(map);

  // On centre la carte sur la position de l'utilisateur
  showCurrentPosition();
  // Génère de nouveaux pokémon toutes les 5 secondes
  setInterval(createPokemons, 5000);
}

function showCurrentPosition() {
  map.setView([lat, long], 18);
}

function createPokemons() {
  // Détermine combien de pokémon seront générés de manière aléatoire (entre 1 et 5)
  const spawn = Math.floor(Math.random() * 5 + 1);

  // Layer des pokémon à modifier
  let layerNumbers = [];
  for (let i = 0; i < spawn; i++) {
    layerNumbers.push(Math.floor(Math.random() * 20 + 1));
  }

  layerNumbers.forEach((layerNumber) => {
    let layer = getLayer(layerNumber);

    layer.clearLayers();

    if (Math.random() > 0.25) {
      const pokedexId = Math.floor(Math.random() * 898 + 1);

      fetch(`https://pokebuildapi.fr/api/v1/pokemon/${pokedexId}`)
        .then((response) => response.json())
        .then((pokemon) => {
          var myIcon = L.icon({
            iconUrl: pokemon.sprite,
            iconSize: [100, 100],
            iconAnchor: [50, 50],
            popupAnchor: [0, -30],
          });

          const marker = new L.marker(
            [
              Math.random() > 0.5
                ? lat + Math.random() / 600
                : lat - Math.random() / 600,
              Math.random() > 0.5
                ? long + Math.random() / 600
                : long - Math.random() / 600,
            ],
            { icon: myIcon }
          );
          marker.on("click", () => {
            showDetails(pokemon.pokedexId);
          });

          marker
            .bindPopup(
              `<div class="popup">
                <img id="pokeball" data-layer="${layerNumber}" data-pokemon="${
                pokemon.pokedexId
              }" src="${
                capturedPokemon.includes(pokemon.pokedexId)
                  ? "assets/icons/pokeball-rouge.svg"
                  : "assets/icons/pokeball-gray.svg"
              }">
                <p>${pokemon.name}</p>
              </div>`
            )
            .openPopup();

          layer.addLayer(marker);
          map.addLayer(layer);
        });
    }
  });
}

function catchPokemon(pokemonId, layerId) {
  const captured = Math.random() > 0.5; // 50% de chance de capturer le pokémon

  if (captured) {
    // Si capturé, on ajoute le pokémon au tableau des pokémon capturés (localStorage)
    capturedPokemon.push(pokemonId);
    localStorage.setItem("pokemons-" + user, JSON.stringify(capturedPokemon));

    // Affichage du pokédex avec infos SI capturé
    const pokedex = document.getElementById("pokedex");
    pokedex.classList.remove("pokedex-hidden");

    // Condition pour fermer le pokédex automatiquement en responsive
    if (window.matchMedia("(max-width: 810px)").matches) {
      setTimeout(() => {
        pokedex.classList.add("pokedex-hidden");
      }, 2000);
    }
  }
  // Fais disparaitre le pokémon
  const layer = getLayer(layerId);
  layer.clearLayers();
}

//
function showDetails(pokemonId) {
  fetch(`https://pokebuildapi.fr/api/v1/pokemon/${pokemonId}`)
    .then((response) => response.json())
    .then((pokemon) => {
      const detail = document.getElementById("detail");
      detail.innerHTML = `
        <h3 class="catch">Pokémon capturé !</h3>
        <div class="pokeDetail">
        <p class="number">n°${pokemon.pokedexId}</p>
        <img class="picture" src="${pokemon.image}">
        <h2 class="name">${pokemon.name}</h2>
        </div>
        <div class="types">
          <p>Type${pokemon.apiTypes.length > 1 ? "s" : ""}</p>
          <div id="types"></div>
        </div>
        `;

      const types = document.getElementById("types");
      pokemon.apiTypes.forEach(function (type) {
        types.innerHTML += `<img class="type" src="${type.image}">`;
      });

      const evolutionDiv = document.getElementById("evolution");

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
    });
}

function initPage() {
  map.on("popupopen", () => {
    const pokedex = document.getElementById("pokedex");
    pokedex.classList.add("pokedex-hidden");

    const pokeball = document.getElementById("pokeball");
    const pokemonId = Number(pokeball.dataset.pokemon);
    const layerId = Number(pokeball.dataset.layer);
    pokeball.addEventListener("click", () => {
      catchPokemon(pokemonId, layerId);
    });
  });

  const close = document.getElementById("close");
  close.addEventListener("click", () => {
    const pokedex = document.getElementById("pokedex");
    pokedex.classList.add("pokedex-hidden");
  });

  const userForm = document.getElementById("user-form");
  userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    user = userForm[0].value.trim().toLowerCase();

    const popup = document.getElementById("connexion");
    popup.classList.add("connexion-hide");

    capturedPokemon =
      JSON.parse(localStorage.getItem("pokemons-" + user)) ?? [];
  });


  // Musique d'ambiance en fond, lecture automatique avec possibilité de mettre en pause
  const backgroundMusic = document.getElementById("background-music")
  const soundButton = document.getElementById("sound")
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
  })
}


generateMap();
initPage();
getPostion();
