# PokemonGo-Like

Les 898 pokémons spawn de manière aléatoire (API Pokebuild), à divers emplacements autour de la localisation du joueur. De nouveaux pokémons sont générés toutes les 5 secondes (entre 1 et 5 pokémons générés à la fois). Toutes les 5 secondes les pokémons sont susceptibles de disparaitre de la carte.

Une pokeball grise indique que le pokémon n'a jamais été capturé par le joueur. Une pokeball rouge indique que le pokémon a déjà été capturé par le joueur.

Historique de pokémons capturés (par joueur) dans le localstorage sous forme de tableau.

Pour jouer : Activer la géolocalisation (-> Bibliothèque JS Leaflet) S'identifier avec un pseudo. Cliquer sur les pokémons. Pour capturer : cliquer sur la pokéball à côté du nom du pokémon. -> Si le pokédex s'ouvre : Pokémon capturé ! -> Si rien ne se passe : Le pokémon s'est enfuit.