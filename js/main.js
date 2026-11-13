const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const moviesContainer = document.getElementById("moviesContainer");
const yearFilter = document.getElementById("yearFilter");
const typeFilter = document.getElementById("typeFilter");
const modal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const sectionTitle = document.getElementById("sectionTitle");
const resultsDescription = document.getElementById("resultsDescription");

let currentView = "explore";
let currentMovies = [];
let searchTimer;
let requestToken = 0;
let activeQuery = "";
function updateFilterAvailability() {
  const enabled = currentView === "favorites" ? currentMovies.length > 0 : Boolean(activeQuery && currentMovies.length);
  yearFilter.disabled = !enabled;
  typeFilter.disabled = !enabled;
  document.getElementById("clearFilters").disabled = !enabled;
  document.getElementById("filtersPanel").classList.toggle("filters-disabled", !enabled);
  document.getElementById("filtersHint").textContent = enabled ? "Refine os resultados encontrados." : "Pesquise um título para liberar os filtros.";
}


function updateFavoritesCount() {
  document.getElementById("favoritesCount").textContent = getFavorites().length;
}
function setActiveNav(view) {
  document.getElementById("homeBtn").classList.toggle("active", view === "explore");
  document.getElementById("favoritesBtn").classList.toggle("active", view === "favorites");
}
function getFilters() { return { year: yearFilter.value.trim(), type: typeFilter.value }; }
function filterCurrentMovies(movies) {
  const { year, type } = getFilters();
  return movies.filter((movie) => {
    const yearMatch = !year || String(movie.Year || "").split("–")[0].startsWith(year);
    const typeMatch = type === "all" || movie.Type === type;
    return yearMatch && typeMatch;
  });
}
function updateResultText(count) {
  resultsDescription.textContent = `${count} ${count === 1 ? "título encontrado" : "títulos encontrados"}.`;
}

async function performSearch(query = searchInput.value.trim()) {
  activeQuery = query;
  const token = ++requestToken;
  if (!query) {
    hideLoader();
    currentMovies = [];
    yearFilter.value = "";
    typeFilter.value = "all";
    updateFilterAvailability();
    moviesContainer.innerHTML = "";
    document.getElementById("emptyState").classList.remove("hidden");
    document.getElementById("emptyState").querySelector("h3").textContent = "O que vamos assistir?";
    document.getElementById("emptyState").querySelector("p").textContent = "Digite o nome de um filme ou série para começar sua descoberta.";
    sectionTitle.textContent = "Explore títulos";
    resultsDescription.textContent = "Encontre algo novo para assistir hoje.";
    return;
  }
  currentView = "explore";
  setActiveNav("explore");
  sectionTitle.textContent = "Resultados da busca";
  showLoader();
  document.getElementById("emptyState").classList.add("hidden");
  try {
    const movies = await searchMovies(query);
    if (token !== requestToken) return;
    currentMovies = movies;
    updateFilterAvailability();
    const filtered = filterCurrentMovies(currentMovies);
    renderMovies(filtered, { emptyTitle: "Nada por aqui ainda", emptyMessage: "Não encontramos resultados com esses filtros. Tente alterar sua busca." });
    updateResultText(filtered.length);
  } catch (error) {
    if (token !== requestToken) return;
    currentMovies = [];
    updateFilterAvailability();
    renderMovies([], { emptyTitle: "Não foi possível carregar", emptyMessage: error.message || "Verifique sua conexão e tente novamente." });
    resultsDescription.textContent = "Ocorreu um problema na busca.";
  } finally {
    if (token === requestToken) hideLoader();
  }
}

function showFavorites() {
  requestToken++;
  currentView = "favorites";
  setActiveNav("favorites");
  sectionTitle.textContent = "Minha lista";
  resultsDescription.textContent = "Seus títulos salvos para assistir depois.";
  searchInput.value = "";
  currentMovies = getFavorites();
  updateFilterAvailability();
  const filtered = filterCurrentMovies(currentMovies);
  renderMovies(filtered, { emptyTitle: "Sua lista está esperando por você", emptyMessage: "Toque no coração de um filme ou série para salvar aqui." });
  updateResultText(filtered.length);
  hideLoader();
}

async function openMovieDetails(imdbID) {
  modalBody.innerHTML = '<div class="loader"><span class="spinner"></span><span>Carregando detalhes...</span></div>';
  if (!modal.open) modal.showModal();
  try {
    const movie = await getMovieDetails(imdbID);
    renderMovieDetails(movie);
  } catch (error) {
    modalBody.innerHTML = `<div class="empty-state"><h3>Ops! Não carregamos os detalhes.</h3><p>${escapeHTML(error.message)}</p></div>`;
  }
}

function handleFavorite(imdbID) {
  const movie = [...currentMovies, ...getFavorites()].find((item) => item.imdbID === imdbID);
  if (!movie) return;
  const added = toggleFavorite(movie);
  updateFavoritesCount();
  showToast(added ? "Adicionado à sua lista ♥" : "Removido da sua lista");
  if (modal.open) {
    const button = document.getElementById("modalFavoriteBtn");
    if (button) button.textContent = added ? "♥ Remover dos favoritos" : "♡ Adicionar aos favoritos";
  }
  if (currentView === "favorites") showFavorites();
  else renderMovies(filterCurrentMovies(currentMovies));
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(searchTimer);
  performSearch();
});
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  const query = searchInput.value.trim();
  if (!query) { performSearch(""); return; }
  searchTimer = setTimeout(() => performSearch(query), 450);
});
[yearFilter, typeFilter].forEach((filter) => filter.addEventListener("input", () => {
  if (currentView === "favorites") showFavorites();
  else if (activeQuery) {
    const filtered = filterCurrentMovies(currentMovies);
    renderMovies(filtered, { emptyTitle: "Nenhum resultado com esses filtros", emptyMessage: "Experimente outro ano ou tipo de conteúdo." });
    updateResultText(filtered.length);
  }
}));
document.getElementById("clearFilters").addEventListener("click", () => {
  yearFilter.value = "";
  typeFilter.value = "all";
  if (currentView === "favorites") showFavorites();
  else if (activeQuery) {
    const filtered = filterCurrentMovies(currentMovies);
    renderMovies(filtered);
    updateResultText(filtered.length);
  }
});
document.getElementById("homeBtn").addEventListener("click", () => {
  currentView = "explore";
  setActiveNav("explore");
  searchInput.value = "";
  performSearch("");
});
document.getElementById("favoritesBtn").addEventListener("click", showFavorites);
document.getElementById("themeToggle").addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  saveTheme(theme);
});

document.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    event.stopPropagation();
    handleFavorite(favoriteButton.dataset.favorite);
    return;
  }
  const detailsTarget = event.target.closest("[data-details]");
  if (detailsTarget) openMovieDetails(detailsTarget.dataset.details);
  if (event.target.id === "closeModal" || event.target.id === "modalCloseAction") modal.close();
});
document.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-details]")) {
    event.preventDefault();
    openMovieDetails(event.target.dataset.details);
  }
  if (event.key === "Escape" && modal.open) modal.close();
});

applyTheme(getSavedTheme());
updateFilterAvailability();
updateFavoritesCount();
