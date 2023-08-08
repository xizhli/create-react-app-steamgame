const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/games', routes.games);
app.get('/popularGames', routes.popularGames);
app.get('/new_games/:age', routes.newGames);
app.get('/reviews_count/:a/:b', routes.reviewsCount);
app.get('/positive_recommendations', routes.positiveRecommendations);
app.get('/top_developers', routes.topDevelopers);
app.get('/developer_games/:Developer', routes.getGameFromDeveloper);
app.get('/reviews/:gameId', routes.getReviewFromGameID);
app.get('/top_publishers', routes.topPublishers);
app.get('/game_selection/:threshold', routes.gameSelection);
app.get('/random', routes.random);
app.get('/search_games', routes.search_games);
app.get('/allgames', routes.getAllGames);
app.get('/gamedetails/:gameId', routes.getGameDetails);
app.get('/getTags', routes.getTags);
app.get('/getGenres', routes.getGenres);
app.get('/getCategories', routes.getCategories);
app.get('/tags', routes.getAllTags);
app.get('/genres', routes.getAllGenres);
app.get('/categories', routes.getAllCategories);
app.get('/popularTags', routes.getPopularTags);
app.get('/popularGenres', routes.getPopularGenres);
app.get('/popularCategories', routes.getPopularCategories);
app.get('/bestGamesOfDecade', routes.getBestGamesOfDecade);
app.get('/mostCostEffectiveGames', routes.getMostCostEffectiveGames);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
