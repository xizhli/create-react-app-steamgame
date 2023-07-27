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
app.get('/popularGames', routes.popularGames);
app.get('/new_games/:age', routes.newGames);
app.get('/reviews_count/:a/:b', routes.reviewsCount);
app.get('/positive_recommendations', routes.positiveRecommendations);
app.get('/top_developers', routes.topDevelopers);
app.get('/top_publishers', routes.topPublishers);
app.get('/game_selection/:threshold', routes.gameSelection);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
