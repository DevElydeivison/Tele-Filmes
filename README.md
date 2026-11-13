# 🎬 TeleFilmes

Aplicação front-end para descobrir filmes e séries, consultar informações detalhadas e salvar títulos em uma lista pessoal. Desenvolvida com HTML, CSS e JavaScript puro, consumindo a OMDb API.

Atualizaçãp

## ✨ Funcionalidades

- 🔎 Busca dinâmica (live search) com debounce e busca por Enter/botão.
- ⭐ Lista de favoritos persistida no `localStorage`.
- 🌙 Alternância entre tema escuro e claro, com preferência salva.
- 🎥 Modal de detalhes com sinopse, avaliação, duração, gênero, direção e elenco.
- 📊 Filtros por ano de lançamento e tipo (filme, série ou episódio).
- 📱 Interface responsiva para desktop, tablet e celular.
- ⏳ Indicador de carregamento, mensagens de estado vazio e tratamento de erros.

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 (Grid, Flexbox, variáveis CSS e media queries)
- JavaScript ES6+ (Fetch API, async/await, DOM e eventos)
- LocalStorage
- [OMDb API](https://www.omdbapi.com/)

## 📂 Estrutura

```text
Tele-Filmes/
├── assets/
│   ├── icon.png
│   └── img/
├── css/
│   └── style.css
├── js/
│   ├── api.js       # Comunicação com a OMDb API
│   ├── main.js      # Eventos e estado da aplicação
│   ├── storage.js   # Favoritos e tema no LocalStorage
│   └── ui.js        # Renderização dos componentes
└── index.html
```

## 🚀 Como executar

1. Extraia os arquivos e abra a pasta no VS Code.
2. Execute o `index.html` usando a extensão Live Server (recomendado).
3. Pesquise por um título. Os resultados aparecem enquanto você digita.

A aplicação utiliza atualmente a chave pública de demonstração que já estava no projeto (`thewdb`). Chaves gratuitas da OMDb podem ter limites, ficar indisponíveis ou ser alteradas. Se a API retornar `Invalid API key`, obtenha sua própria chave em [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) e substitua o valor de `API_KEY` em `js/api.js`.

## 🧠 Conceitos praticados

- Consumo de API REST com Fetch e programação assíncrona.
- Manipulação do DOM e delegação de eventos.
- Persistência no navegador com LocalStorage.
- Debounce para reduzir requisições durante a digitação.
- Estado de interface, filtros e renderização dinâmica.
- Organização de responsabilidades em arquivos JavaScript.
- Responsividade e temas com variáveis CSS.

## 👨‍💻 Autor

Desenvolvido por **Elydeivison Cesar** · [LinkedIn](https://www.linkedin.com/in/elydeivisoncesar/) · [GitHub](https://github.com/DevElyShow)

## Busca em português e filtros (atualização)

A OMDb normalmente pesquisa títulos originais. O projeto agora reconhece uma lista de títulos populares em português (em `js/api.js`, objeto `BRAZILIAN_TITLES`), mantendo a busca normal em inglês. **Isso não cobre todo o catálogo.** Para buscar títulos traduzidos de maneira mais abrangente, crie uma chave de API gratuita no TMDB e preencha `TMDB_API_KEY` em `js/api.js`. O TMDB faz a busca em `pt-BR`, e os resultados com IMDb ID são exibidos no catálogo. Títulos sem IMDb ID não aparecem nesta integração.

Os filtros de ano e tipo ficam desabilitados até que a busca retorne títulos ou haja favoritos salvos. Eles refinam os resultados carregados, não todo o catálogo da API.
