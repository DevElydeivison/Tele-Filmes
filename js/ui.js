function showLoader() { document.getElementById("loader").classList.remove("hidden"); }
function hideLoader() { document.getElementById("loader").classList.add("hidden"); }

function renderMovies(movies, options = {}) {
  const container = document.getElementById("moviesContainer");
  const emptyState = document.getElementById("emptyState");
  container.innerHTML = "";
  if (!movies.length) {
    emptyState.classList.remove("hidden");
    emptyState.querySelector("h3").textContent = options.emptyTitle || "Nenhum título encontrado";
    emptyState.querySelector("p").textContent = options.emptyMessage || "Tente outro termo ou ajuste os filtros.";
    return;
  }
  emptyState.classList.add("hidden");
  const favorites = getFavorites();
  movies.forEach((movie) => {
    const favorite = favorites.some((item) => item.imdbID === movie.imdbID);
    const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "";
    const card = document.createElement("article");
    card.className = "movie-card";
    card.innerHTML = `
      <div class="poster-wrap" data-details="${escapeHTML(movie.imdbID)}" role="button" tabindex="0" aria-label="Ver detalhes de ${escapeHTML(movie.Title)}">
        ${poster ? `<img src="${escapeHTML(poster)}" alt="Pôster de ${escapeHTML(movie.Title)}" loading="lazy" />` : '<div class="poster-placeholder">▧</div>'}
        <button class="favorite-btn ${favorite ? "is-favorite" : ""}" type="button" data-favorite="${escapeHTML(movie.imdbID)}" aria-label="${favorite ? "Remover dos" : "Adicionar aos"} favoritos" title="${favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}">${favorite ? "♥" : "♡"}</button>
      </div>
      <div class="movie-info"><h3 class="movie-title" data-details="${escapeHTML(movie.imdbID)}">${escapeHTML(movie.Title)}</h3><div class="movie-meta"><span>${escapeHTML(movie.Year || "Ano indisponível")}</span><span class="type-tag">${formatType(movie.Type)}</span></div></div>`;
    container.appendChild(card);
  });
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
function formatType(type = "") { return ({ movie: "Filme", series: "Série", episode: "Episódio" })[type] || type; }

function renderMovieDetails(movie) {
  const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "";
  const rating = movie.imdbRating && movie.imdbRating !== "N/A" ? `★ ${movie.imdbRating}/10` : "Nota indisponível";
  document.getElementById("modalBody").innerHTML = `
    ${poster ? `<img class="modal-poster" src="${escapeHTML(poster)}" alt="Pôster de ${escapeHTML(movie.Title)}" />` : '<div class="modal-poster poster-placeholder">▧</div>'}
    <div class="modal-copy"><span class="modal-year">${escapeHTML(movie.Year || "")} · ${escapeHTML(formatType(movie.Type))}</span>
      <h2 id="modalTitle">${escapeHTML(movie.Title || "Detalhes do título")}</h2>
      <div class="modal-facts"><span>${escapeHTML(rating)}</span><span>${escapeHTML(movie.Runtime || "Duração indisponível")}</span><span>${escapeHTML(movie.Rated || "Classificação não informada")}</span></div>
      <p>${escapeHTML(movie.Plot && movie.Plot !== "N/A" ? movie.Plot : "Sinopse não disponível.")}</p>
      <p><strong>Gênero:</strong> ${escapeHTML(movie.Genre || "Não informado")}<br><strong>Direção:</strong> ${escapeHTML(movie.Director || "Não informado")}<br><strong>Elenco:</strong> ${escapeHTML(movie.Actors || "Não informado")}</p>
      <div class="modal-actions"><button class="primary-action" id="modalFavoriteBtn" data-favorite="${escapeHTML(movie.imdbID)}">${isFavorite(movie.imdbID) ? "♥ Remover dos favoritos" : "♡ Adicionar aos favoritos"}</button><button class="secondary-action" id="modalCloseAction" type="button">Fechar detalhes</button></div>
    </div>`;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById("themeIcon").textContent = theme === "dark" ? "☀" : "☾";
  document.getElementById("themeToggle").setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
