// OMDb API: a chave pública de demonstração pode ter limites de uso.
const API_KEY = "thewdb";
const BASE_URL = "https://www.omdbapi.com/";

async function requestOMDb(params) {
  const url = new URL(BASE_URL);
  url.search = new URLSearchParams({ apikey: API_KEY, ...params }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha na comunicação com a API (${response.status}).`);
  const data = await response.json();
  if (data.Response === "False") throw new Error(data.Error || "Não foi possível encontrar os títulos.");
  return data;
}

// Apelidos brasileiros comuns para buscas na OMDb (que indexa principalmente títulos originais).
// Para cobertura ampla de títulos localizados, configure uma chave TMDB abaixo.
const TMDB_API_KEY = ""; // Opcional: https://www.themoviedb.org/settings/api
const BRAZILIAN_TITLES = {
  "vingadores": "The Avengers", "os vingadores": "The Avengers",
  "vingadores ultimato": "Avengers Endgame", "vingadores guerra infinita": "Avengers Infinity War",
  "homem aranha": "Spider-Man", "homem de ferro": "Iron Man",
  "capitao america": "Captain America", "pantera negra": "Black Panther",
  "doutor estranho": "Doctor Strange", "guardioes da galaxia": "Guardians of the Galaxy",
  "o poderoso chefao": "The Godfather", "a origem": "Inception",
  "interestelar": "Interstellar", "a procura da felicidade": "The Pursuit of Happyness",
  "um sonho de liberdade": "The Shawshank Redemption", "clube da luta": "Fight Club",
  "o cavaleiro das trevas": "The Dark Knight", "batman o cavaleiro das trevas": "The Dark Knight",
  "a espera de um milagre": "The Green Mile", "forrest gump": "Forrest Gump",
  "o rei leao": "The Lion King", "procurando nemo": "Finding Nemo",
  "divertida mente": "Inside Out", "meu malvado favorito": "Despicable Me",
  "os incriveis": "The Incredibles", "carros": "Cars", "ratatouille": "Ratatouille",
  "a viagem de chihiro": "Spirited Away", "o castelo animado": "Howl's Moving Castle",
  "a lista de schindler": "Schindler's List", "titanic": "Titanic",
  "de volta para o futuro": "Back to the Future", "jurassic park": "Jurassic Park",
  "parque dos dinossauros": "Jurassic Park", "velozes e furiosos": "Fast & Furious",
  "missao impossivel": "Mission Impossible", "jogos vorazes": "The Hunger Games",
  "crepusculo": "Twilight", "a culpa e das estrelas": "The Fault in Our Stars",
  "como eu era antes de voce": "Me Before You", "diario de uma paixao": "The Notebook",
  "o diabo veste prada": "The Devil Wears Prada", "se beber nao case": "The Hangover",
  "esqueceram de mim": "Home Alone", "gente grande": "Grown Ups",
  "todo mundo em panico": "Scary Movie", "o show de truman": "The Truman Show",
  "la casa de papel": "Money Heist", "a casa do dragao": "House of the Dragon",
  "o jogo da imitacao": "The Imitation Game", "o lobo de wall street": "The Wolf of Wall Street",
  "o senhor dos aneis": "The Lord of the Rings", "a sociedade do anel": "The Lord of the Rings",
  "a guerra dos tronos": "Game of Thrones", "o gambito da rainha": "The Queen's Gambit",
  "breaking bad": "Breaking Bad", "sobrenatural": "Supernatural",
  "the last of us": "The Last of Us", "round 6": "Squid Game",
  "a vida e bela": "Life Is Beautiful", "parasita": "Parasite",
  "cidade de deus": "City of God", "tropa de elite": "Elite Squad",
  "central do brasil": "Central Station", "auto da compadecida": "A Dog's Will"
};
function normalizeTitle(title) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
async function searchTMDB(query) {
  const url = new URL("https://api.themoviedb.org/3/search/multi");
  url.search = new URLSearchParams({ api_key: TMDB_API_KEY, language: "pt-BR", query, include_adult: "false" });
  const response = await fetch(url);
  if (!response.ok) throw new Error("Busca TMDB indisponível.");
  const data = await response.json();
  return (data.results || []).filter(item => item.media_type === "movie" || item.media_type === "tv");
}
async function searchLocalizedMovies(query) {
  if (!TMDB_API_KEY) return [];
  const titles = await searchTMDB(query);
  const matches = await Promise.all(titles.slice(0, 12).map(async (item) => {
    try {
      const imdbID = item.media_type === "movie" ? await getTMDBImdbID("movie", item.id) : await getTMDBImdbID("tv", item.id);
      if (!imdbID) return null;
      return { imdbID, Title: item.title || item.name, Year: (item.release_date || item.first_air_date || "").slice(0, 4), Type: item.media_type === "movie" ? "movie" : "series", Poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "N/A" };
    } catch { return null; }
  }));
  return matches.filter(Boolean);
}
async function getTMDBImdbID(type, id) {
  const endpoint = type === "tv" ? `tv/${id}/external_ids` : `movie/${id}/external_ids`;
  const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${encodeURIComponent(TMDB_API_KEY)}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  return (await response.json()).imdb_id || null;
}
async function searchMovies(query, filters = {}) {
  const params = { s: query };
  if (filters.type && filters.type !== "all") params.type = filters.type;
  if (filters.year) params.y = filters.year;
  const alias = BRAZILIAN_TITLES[normalizeTitle(query)];
  const searches = [query, ...(alias && normalizeTitle(alias) !== normalizeTitle(query) ? [alias] : [])];
  const results = await Promise.all(searches.map(async (term) => {
    try { const data = await requestOMDb({ ...params, s: term }); return data.Search || []; }
    catch (error) {
      if (/not found/i.test(error.message)) return [];
      throw error;
    }
  }));
  if (TMDB_API_KEY) {
    try { results.push(await searchLocalizedMovies(query)); }
    catch (error) { console.warn("Busca localizada indisponível:", error.message); }
  }
  return [...new Map(results.flat().map(movie => [movie.imdbID, movie])).values()];
}

async function getMovieDetails(imdbID) {
  return requestOMDb({ i: imdbID, plot: "full" });
}
