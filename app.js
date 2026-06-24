const API_KEY = "FBfrEJCbfzm5CytqoZel6z5mcRbQsG6MSXW51E39";
const BASE_URL = "https://api.nasa.gov/planetary/apod";

let currentAPOD = null;

async function fetchAPOD(date = "") {
  let url = `${BASE_URL}?api_key=${API_KEY}`;

  if (date) {
    url += `&date=${date}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Demasiadas solicitudes. Espera un momento e intenta de nuevo.");
    }
    const errorData = await response.json();
    throw new Error(errorData.msg || `Error HTTP: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

function showLoading() {
  document.getElementById("loadingSpinner").style.display = "block";
  document.getElementById("apodContent").style.display = "none";
}

function hideLoading() {
  document.getElementById("loadingSpinner").style.display = "none";
  document.getElementById("apodContent").style.display = "block";
}

function showError(message) {
  const errorEl = document.getElementById("errorMessage");
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function hideError() {
  document.getElementById("errorMessage").style.display = "none";
}

function displayAPOD(data) {
  const titleEl = document.getElementById("apodTitle");
  const dateEl = document.getElementById("apodDate");
  const imageEl = document.getElementById("apodImage");
  const videoContainer = document.getElementById("videoContainer");
  const videoEl = document.getElementById("apodVideo");
  const explanationEl = document.getElementById("apodExplanation");
  const copyrightEl = document.getElementById("apodCopyright");

  titleEl.textContent = data.title;
  dateEl.innerHTML = `<i class="bi bi-calendar"></i> ${data.date}`;

  if (data.media_type === "image") {
    imageEl.src = data.url;
    imageEl.alt = data.title;
    imageEl.style.display = "block";
    videoContainer.style.display = "none";
  } else if (data.media_type === "video") {
    videoEl.src = data.url;
    videoEl.title = data.title;
    videoContainer.style.display = "block";
    imageEl.style.display = "none";
  }

  explanationEl.textContent = data.explanation;

  if (data.copyright) {
    copyrightEl.innerHTML = `<i class="bi bi-c-circle"></i> ${data.copyright}`;
    copyrightEl.style.display = "block";
  } else {
    copyrightEl.style.display = "none";
  }

  updateFavoriteButton(data.date);
}

function updateFavoriteButton(date) {
  const favBtn = document.getElementById("favoriteToggleBtn");
  const favorites = getFavorites();
  const isFavorite = favorites.some((fav) => fav.date === date);

  if (isFavorite) {
    favBtn.innerHTML = `<i class="bi bi-heart-fill"></i> Favorito`;
    favBtn.classList.remove("btn-outline-warning");
    favBtn.classList.add("btn-warning");
  } else {
    favBtn.innerHTML = `<i class="bi bi-heart"></i> Favorito`;
    favBtn.classList.remove("btn-warning");
    favBtn.classList.add("btn-outline-warning");
  }
}

async function loadAPOD(date = "") {
  showLoading();
  hideError();

  try {
    const data = await fetchAPOD(date);
    currentAPOD = data;
    displayAPOD(data);
    hideLoading();

    const dateInput = document.getElementById("datePicker");
    if (dateInput) {
      dateInput.value = data.date;
    }
  } catch (error) {
    hideLoading();
    showError(error.message);
  }
}

function setupDateInput() {
  const dateInput = document.getElementById("datePicker");

  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("max", today);
  dateInput.setAttribute("min", "1995-06-16");
  dateInput.value = today;
}

function handleDateChange() {
  const dateInput = document.getElementById("datePicker");
  const selectedDate = dateInput.value;
  const today = new Date().toISOString().split("T")[0];
  console.log(dateInput);
  console.log(selectedDate);
  console.log(today);

  hideError();

  if (selectedDate > today) {
    showError("No puedes seleccionar una fecha futura. La NASA aún no tiene esos datos.");
    dateInput.value = today;
    return;
  }

  if (selectedDate < "1995-06-16") {
    showError("La primera APOD fue publicada el 16 de junio de 1995.");
    dateInput.value = "1995-06-16";
    return;
  }

  loadAPOD(selectedDate);
}

function getFavorites() {
  const favorites = localStorage.getItem("apod-favorites");
  return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem("apod-favorites", JSON.stringify(favorites));
}

function toggleFavorite() {
  if (!currentAPOD) return;

  const favorites = getFavorites();
  const existingIndex = favorites.findIndex((fav) => fav.date === currentAPOD.date);

  if (existingIndex !== -1) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.push({
      date: currentAPOD.date,
      title: currentAPOD.title,
      url: currentAPOD.url,
      media_type: currentAPOD.media_type,
    });
  }

  saveFavorites(favorites);
  renderFavorites();
  updateFavoriteButton(currentAPOD.date);
}

function removeFavorite(date) {
  let favorites = getFavorites();
  favorites = favorites.filter((fav) => fav.date !== date);
  saveFavorites(favorites);
  renderFavorites();

  if (currentAPOD && currentAPOD.date === date) {
    updateFavoriteButton(date);
  }
}

function clearAllFavorites() {
  localStorage.removeItem("apod-favorites");
  renderFavorites();

  if (currentAPOD) {
    updateFavoriteButton(currentAPOD.date);
  }
}

function renderFavorites() {
  const favoritesListEl = document.getElementById("favoritesList");
  const noFavoritesMsg = document.getElementById("noFavoritesMessage");
  const favorites = getFavorites();

  favoritesListEl.innerHTML = "";

  if (favorites.length === 0) {
    favoritesListEl.innerHTML = `
      <p class="text-muted text-center">
        <i class="bi bi-heart"></i> No tienes favoritos guardados
      </p>`;
    noFavoritesMsg.style.display = "none";
    return;
  }

  noFavoritesMsg.style.display = "none";

  favorites.forEach((fav) => {
    const favItem = document.createElement("div");
    favItem.className = "favorite-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded";

    const link = document.createElement("span");
    link.textContent = `${fav.title} (${fav.date})`;
    link.style.cursor = "pointer";
    link.className = "text-truncate";
    link.addEventListener("click", () => {
      loadAPOD(fav.date);
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-outline-danger btn-sm ms-2";
    removeBtn.innerHTML = `<i class="bi bi-trash"></i>`;
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFavorite(fav.date);
    });

    favItem.appendChild(link);
    favItem.appendChild(removeBtn);
    favoritesListEl.appendChild(favItem);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupDateInput();
  loadAPOD();
  renderFavorites();

  document.getElementById("loadDateBtn").addEventListener("click", handleDateChange);
  document.getElementById("datePicker").addEventListener("change", handleDateChange);
  document.getElementById("favoriteToggleBtn").addEventListener("click", toggleFavorite);
  document.getElementById("clearFavoritesBtn").addEventListener("click", clearAllFavorites);
});
