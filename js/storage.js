const FAVORITES_KEY = "telefilmes:favorites";
const THEME_KEY = "telefilmes:theme";

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
  catch { return []; }
}
function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}
function isFavorite(imdbID) {
  return getFavorites().some((movie) => movie.imdbID === imdbID);
}
function toggleFavorite(movie) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.imdbID === movie.imdbID);
  const updated = exists ? favorites.filter((item) => item.imdbID !== movie.imdbID) : [...favorites, movie];
  saveFavorites(updated);
  return !exists;
}
function getSavedTheme() { return localStorage.getItem(THEME_KEY) || "dark"; }
function saveTheme(theme) { localStorage.setItem(THEME_KEY, theme); }
