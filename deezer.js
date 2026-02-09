// Mon URL de proxy pour contourner les CORS de Deezer
// Utilise l'URL encodée en base64 pour éviter les problèmes de parsing
const proxyUrl =
  "https://ntonnaire.numerica-academie.fr/DEEZER_Test_API/local.php";
const deezerAPI = "https://api.deezer.com/search/artist?q=";

// Variable pour stocker la chanson sélectionnée
let sonSelect = null;

// Variable pour stocker l'artiste courant (pour le retour aux albums)
let currentArtistId = null;
let currentArtistName = null;

// Fonction pour rechercher un artiste
async function rechercheArtiste() {
  const artiste = document.getElementById("artiste").value;
  if (artiste.length === 0) {
    alert("Veuillez entrer le nom d'un artiste");
    return;
  }
  // Appel à l'API Deezer via le proxy (avec encodage base64)
  try {
    const targetUrl = deezerAPI + artiste;
    const encodedUrl = btoa(targetUrl);
    const response = await fetch(`${proxyUrl}?data=${encodedUrl}`);

    // Je vérifie si la réponse est OK
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Je vérifie le type de contenu
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const texte = await response.text();
      console.error("Réponse non-JSON reçue:", texte);
      throw new Error("Le serveur n'a pas renvoyé de JSON");
    }

    const data = await response.json();
    console.log(data);
    afficherResultats(data);
  } catch (error) {
    console.error("Erreur:", error);
    alert(
      "Une erreur est survenue lors de la recherche. Je vérifie que le proxy fonctionne correctement.",
    );
  }
}

// J'ajoute l'événement au bouton
const boutonRecherche = document.getElementById("bouton-recherche");
boutonRecherche.addEventListener("click", rechercheArtiste);

// Fonction pour afficher les résultats
function afficherResultats(data) {
  // Je récupère la div des résultats
  const resultatsDiv = document.getElementById("resultats");
  resultatsDiv.innerHTML = "";

  // Je vérifie si des résultats ont été trouvés
  if (!data.data || data.data.length === 0) {
    resultatsDiv.innerHTML =
      '<div class="no-results">Aucun résultat trouvé</div>';
    return;
  }

  data.data.forEach((artiste) => {
    // Je crée un élément pour chaque artiste
    const artisteDiv = document.createElement("div");
    artisteDiv.classList.add("artiste");
    artisteDiv.style.cursor = "pointer"; // J'indique que c'est cliquable

    // J'ajoute le nom et l'image de l'artiste
    const nomArtiste = document.createElement("h3");
    nomArtiste.textContent = artiste.name;

    const imageArtiste = document.createElement("img");
    imageArtiste.src = artiste.picture_medium;
    imageArtiste.alt = artiste.name;

    // J'ajoute les éléments à la div artiste
    artisteDiv.appendChild(nomArtiste);
    artisteDiv.appendChild(imageArtiste);

    // J'ajoute l'événement de clic sur l'artiste pour charger ses albums
    artisteDiv.addEventListener("click", () => {
      chargerAlbums(artiste.id, artiste.name);
    });

    resultatsDiv.appendChild(artisteDiv);
  });
}

// Je charge les albums d'un artiste
async function chargerAlbums(artisteId, artisteName) {
  // Je stocke l'artiste courant pour pouvoir retourner aux albums
  currentArtistId = artisteId;
  currentArtistName = artisteName;

  const albumsUrl = `https://api.deezer.com/artist/${artisteId}/albums`;

  try {
    const encodedUrl = btoa(albumsUrl);
    const response = await fetch(`${proxyUrl}?data=${encodedUrl}`);

    // Je vérifie si la réponse est OK
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Albums:", data);
    afficherAlbums(data, artisteName);
  } catch (error) {
    console.error("Erreur lors du chargement des albums:", error);
    alert("Impossible de charger les albums de cet artiste");
  }
}

// J'affiche les albums
function afficherAlbums(data, artisteName) {
  const resultatsDiv = document.getElementById("resultats");
  resultatsDiv.innerHTML = "";

  // J'ajoute un titre
  const titre = document.createElement("h2");
  titre.textContent = `Albums de ${artisteName}`;
  titre.style.marginBottom = "20px";
  resultatsDiv.appendChild(titre);

  // Je crée le bouton retour
  const boutonRetour = document.createElement("button");
  boutonRetour.textContent = "← Retour aux artistes";
  boutonRetour.style.marginBottom = "20px";
  boutonRetour.addEventListener("click", rechercheArtiste);
  resultatsDiv.appendChild(boutonRetour);

  // Je vérifie si des albums ont été trouvés
  if (!data.data || data.data.length === 0) {
    resultatsDiv.innerHTML +=
      '<div class="no-results">Aucun album trouvé</div>';
    return;
  }

  // Je crée un conteneur pour les albums
  const albumsContainer = document.createElement("div");
  albumsContainer.style.display = "grid";
  albumsContainer.style.gridTemplateColumns =
    "repeat(auto-fill, minmax(200px, 1fr))";
  albumsContainer.style.gap = "20px";

  data.data.forEach((album) => {
    const albumDiv = document.createElement("div");
    albumDiv.classList.add("album");
    albumDiv.style.cursor = "pointer";

    const imageAlbum = document.createElement("img");
    imageAlbum.src = album.cover_medium;
    imageAlbum.alt = album.title;

    const nomAlbum = document.createElement("h4");
    nomAlbum.textContent = album.title;

    albumDiv.appendChild(imageAlbum);
    albumDiv.appendChild(nomAlbum);

    // Je vérifie que l'événement est ajouté à l'intérieur de la boucle
    albumDiv.addEventListener("click", () => {
      chargerMusiques(album.id, album.title);
    });

    albumsContainer.appendChild(albumDiv);
  });

  resultatsDiv.appendChild(albumsContainer);
}

// Au click sur l'album, j'affiche les musiques de cet album

async function chargerMusiques(albumId, albumTitle) {
  const trackUrl = `https://api.deezer.com/album/${albumId}/tracks`;

  try {
    const encodedUrl = btoa(trackUrl);
    const response = await fetch(`${proxyUrl}?data=${encodedUrl}`);

    // Je vérifie si la réponse est OK
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Musiques:", data);
    afficherMusiques(data, albumTitle);
  } catch (error) {
    console.error("Erreur lors du chargement des musiques:", error);
    alert("Impossible de charger les musiques de cet album");
  }
}

// J'affiche les musiques d'album

function afficherMusiques(data, albumTitle) {
  const resultatsDiv = document.getElementById("resultats");
  resultatsDiv.innerHTML = "";

  // J'ajoute un titre
  const titre = document.createElement("h2");
  titre.textContent = `Musiques de l'album ${albumTitle}`;
  titre.style.marginBottom = "20px";
  resultatsDiv.appendChild(titre);

  // Je crée le bouton retour
  const boutonRetour = document.createElement("button");
  boutonRetour.textContent = "← Retour aux albums";
  boutonRetour.style.marginBottom = "20px";
  boutonRetour.addEventListener("click", () => {
    // Je vérifie si j'ai les infos de l'artiste pour retourner aux albums
    if (currentArtistId && currentArtistName) {
      chargerAlbums(currentArtistId, currentArtistName);
    }
  });
  resultatsDiv.appendChild(boutonRetour);

  // Je vérifie si des musiques ont été trouvées
  if (!data.data || data.data.length === 0) {
    resultatsDiv.innerHTML +=
      '<div class="no-results">Aucune musique trouvée</div>';
    return;
  }

  // Je crée une liste pour les musiques
  const musiquesList = document.createElement("ul");
  musiquesList.style.listStyle = "none";
  musiquesList.style.padding = "0";

  data.data.forEach((musique) => {
    const musiqueItem = document.createElement("li");
    musiqueItem.style.display = "flex";
    musiqueItem.style.alignItems = "center";
    musiqueItem.style.padding = "10px";
    musiqueItem.style.margin = "5px 0";
    musiqueItem.style.backgroundColor = "#f0f0f0";
    musiqueItem.style.borderRadius = "5px";
    musiqueItem.style.cursor = "pointer";
    musiqueItem.style.justifyContent = "space-between";

    // Je récupère les infos de la musique (titre + durée)
    const musiqueInfo = document.createElement("div");
    musiqueInfo.style.flex = "1";

    const musiqueTitle = document.createElement("span");
    musiqueTitle.textContent = musique.title;
    musiqueTitle.style.fontWeight = "500";

    // Je convertis la durée en minutes:secondes
    const duration = Math.floor(musique.duration);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    const musiqueDuration = document.createElement("span");
    musiqueDuration.textContent = `(${durationText})`;
    musiqueDuration.style.color = "#666";
    musiqueDuration.style.marginLeft = "10px";
    musiqueDuration.style.fontSize = "0.9em";

    musiqueInfo.appendChild(musiqueTitle);
    musiqueInfo.appendChild(musiqueDuration);

    // Je crée le bouton play
    const playButton = document.createElement("button");
    playButton.textContent = "▶️ Écouter";
    playButton.style.padding = "8px 15px";
    playButton.style.backgroundColor = "#4CAF50";
    playButton.style.color = "white";
    playButton.style.border = "none";
    playButton.style.borderRadius = "5px";
    playButton.style.cursor = "pointer";
    playButton.style.fontSize = "0.9em";

    // Je vérifie si une preview est disponible
    if (musique.preview) {
      playButton.addEventListener("click", (e) => {
        e.stopPropagation();
        jouerPreview(musique.preview, musiqueItem);
      });
    } else {
      playButton.textContent = "Pas d'aperçu";
      playButton.style.backgroundColor = "#ccc";
      playButton.style.cursor = "not-allowed";
    }

    musiqueItem.appendChild(musiqueInfo);
    musiqueItem.appendChild(playButton);

    // J'ajoute un effet au survol
    musiqueItem.addEventListener("mouseenter", () => {
      // Je vérifie si la musique a une preview
      if (musique.preview) {
        musiqueItem.style.backgroundColor = "#e0e0e0";
      }
    });
    musiqueItem.addEventListener("mouseleave", () => {
      musiqueItem.style.backgroundColor = "#f0f0f0";
    });

    musiquesList.appendChild(musiqueItem);
  });

  resultatsDiv.appendChild(musiquesList);
}

// Je récupère l'élément audio du HTML
const audioPlayer = document.getElementById("audio-player");
let currentMusiqueItem = null;

// Fonction pour jouer la preview
function jouerPreview(previewUrl, musiqueItem) {
  // Je vérifie si c'est la même chanson en cours de lecture
  if (sonSelect === previewUrl && !audioPlayer.paused) {
    audioPlayer.pause();
    audioPlayer.style.display = "none";
    sonSelect = null;

    // Je réinitialise le style
    if (currentMusiqueItem) {
      currentMusiqueItem.style.backgroundColor = "#f0f0f0";
      currentMusiqueItem.style.color = "black";
      currentMusiqueItem.style.fontWeight = "normal";
    }
    currentMusiqueItem = null;
    return;
  }

  // Je vérifie si la preview est disponible
  if (!previewUrl) {
    alert("Aperçu non disponible pour cette chanson");
    return;
  }

  // Je réinitialise le style de l'élément précédent
  if (currentMusiqueItem) {
    currentMusiqueItem.style.backgroundColor = "#f0f0f0";
    currentMusiqueItem.style.color = "black";
    currentMusiqueItem.style.fontWeight = "normal";
  }

  // Je change la source et je lance la lecture
  audioPlayer.src = previewUrl;
  audioPlayer.style.display = "block";
  audioPlayer.play();

  sonSelect = previewUrl;
  currentMusiqueItem = musiqueItem;

  // Je change le style pour indiquer qu'elle est en lecture
  musiqueItem.style.backgroundColor = "#4CAF50";
  musiqueItem.style.color = "white";
  musiqueItem.style.fontWeight = "bold";

  // Quand l'audio se termine, je réinitialise
  audioPlayer.onended = () => {
    musiqueItem.style.backgroundColor = "#f0f0f0";
    musiqueItem.style.color = "black";
    musiqueItem.style.fontWeight = "normal";
    sonSelect = null;
    currentMusiqueItem = null;
  };

  // Je gère les erreurs
  audioPlayer.onerror = () => {
    alert("Erreur lors de la lecture de l'aperçu");
    musiqueItem.style.backgroundColor = "#f0f0f0";
    musiqueItem.style.color = "black";
    musiqueItem.style.fontWeight = "normal";
    audioPlayer.style.display = "none";
    sonSelect = null;
    currentMusiqueItem = null;
  };
}

// Fonction pour vider les résultats
function viderResultats() {
  const resultatsDiv = document.getElementById("resultats");
  resultatsDiv.innerHTML = "";
  document.getElementById("artiste").value = "";
}
