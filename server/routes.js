const mysql = require('mysql');
const config = require('./config.json');

const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});

connection.connect((err) => err && console.log(err));

/******************
 * ROUTE HANDLERS *
 ******************/

// Route 0: GET /games get random 30 games to show in main page
const games = async function (req, res) {
  const query1 = `
  select id, name, Screenshots, Movies from
  (select GameID, Screenshots, Movies from Media where GameID >= rand() * (select max(GameID) from Media)) M
  left join
  (select id, name from Game) G
  on M.GameID = G.id
  limit 28
  `;

  connection.query(query1, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 1: GET /popular_games
const popularGames = async function (req, res) {
  const query1 = `
    WITH dev_popular_games AS (
      SELECT C.Developer, G.id AS GameID, COUNT(*) as recommend_count
      FROM Creator C
      JOIN Game G ON C.GameID = G.id
      JOIN Recommendation R ON G.id = R.GameID
      WHERE R.recommended = true
      GROUP BY C.Developer, G.id
    ),
    dev_max_counts AS (
      SELECT Developer, MAX(recommend_count) as max_count
      FROM dev_popular_games
      GROUP BY Developer
    ),
    dev_top_games AS (
      SELECT DPG.Developer, DPG.GameID
      FROM dev_popular_games DPG
      JOIN dev_max_counts DMC ON DPG.Developer = DMC.Developer AND
      DPG.recommend_count = DMC.max_count
    ),
    dev_game_avg_stats AS (
      SELECT DTG.Developer, AVG(G.price) as average_price,
      AVG(R.score) as average_score, AVG(DPG.recommend_count) as
      average_recommend_count
      FROM dev_top_games DTG
      JOIN Game G ON DTG.GameID = G.id
      JOIN Review R ON G.id = R.GameID
      JOIN dev_popular_games DPG ON DTG.GameID = DPG.GameID AND
      DTG.Developer = DPG.Developer
      GROUP BY DTG.Developer
    )
    SELECT * FROM dev_game_avg_stats;
  `;

  connection.query(query1, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 2: GET /new_games/:age
const newGames = async function (req, res) {
  const age = req.params.age;
  const query2 = `
  SELECT Game.id, TIMESTAMPDIFF(YEAR, Game.releaseDate, current_date)
  AS age
  FROM Game
  WHERE TIMESTAMPDIFF(YEAR, Game.releaseDate, current_date) <= ${age};
  `;

  connection.query(query2, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 3: GET /reviews_count/:a/:b
const reviewsCount = async function (req, res) {
  const a = req.params.a;
  const b = req.params.b;
  const query3 = `
    SELECT G.id, COUNT(R.text)
    FROM Game G JOIN Review R ON G.id = R.GameID
    WHERE G.price BETWEEN ${a} AND ${b}
    GROUP BY G.id;
  `;

  connection.query(query3, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 4: GET /positive_recommendations
const positiveRecommendations = async function (req, res) {
  const query4 = `
    SELECT G.id, G.name, SUM(R.recommended) AS positive_recommendations,
    COUNT(*) AS total_recommendations
    FROM Game G JOIN Recommendation R on G.id = R.GameID
    GROUP BY G.id, G.name
    HAVING SUM(R.recommended) > COUNT(R.recommended)*0.8;
  `;

  connection.query(query4, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 5: GET /top_developers
const topDevelopers = async function (req, res) {
  const query5 = `
  WITH recommended_games AS (
      SELECT G.id, G.name
      FROM Game G JOIN Recommendation R on G.id = R.GameID
      GROUP BY G.id, G.name
      HAVING SUM(R.recommended) > COUNT(R.recommended)*0.8)
  SELECT Developer, COUNT(Developer) AS Count
  FROM recommended_games RG JOIN Creator C ON RG.id = C.GameID
  WHERE Developer not in (' Inc.','LTD.','Inc.')
  GROUP BY Developer
  ORDER BY COUNT(Developer) DESC
  LIMIT 30;
  `;

  connection.query(query5, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};


// Route 5.1: GET games when select a developer
const getGameFromDeveloper = async function (req, res) {
  const Developer = req.params.Developer;
  const query51 = `
  select id, name, Screenshots, Movies, Developer, ifnull(TotalhoursPlayed,0) as TotalHoursPlayed, ifnull(NumOfThumbsUp,0) as NumOfThumbsUp  from
  (select id, name from Game) G
  left join
  (select GameID, Screenshots, Movies from Media) M on G.id = M.GameID
  left join
  (select distinct GameID, Developer from Creator) C on G.id = C.GameID
  left join
  (select GameID, SUM(hoursPlayed) as TotalhoursPlayed, sum(funny) as NumOfThumbsUp from Recommendation group by GameID) R on G.id = R.GameID
  where Developer = '${Developer}'
  order by TotalHoursPlayed desc
  `;

  connection.query(query51, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 5.2: GET reviews when select a game
const getReviewFromGameID = async function (req, res) {
  const page = req.query.page ? req.query.page : 1;
  let pageQuery = `;`;
  const pageSize = req.query.page_size ? req.query.page_size : 10;
  pageQuery = `LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize};`;

  const gameId = req.params.gameId;
  const query52 = `
  select text, score, votes from Review
  where GameID = '${gameId}'
  order by votes desc
  `.concat(" ", pageQuery);


  connection.query(query52, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 6: GET /top_publishers
const topPublishers = async function (req, res) {
  const query6 = `
    WITH recommended_games AS (
      SELECT G.id, G.name
      FROM Game G JOIN Recommendation R on G.id = R.GameID
      GROUP BY G.id, G.name
      HAVING SUM(R.recommended) > COUNT(R.recommended)*0.8)
      SELECT Publisher, COUNT(Publisher) AS Count
      FROM recommended_games RG JOIN Creator C ON RG.id = C.GameID
      GROUP BY Publisher
      ORDER BY COUNT(Publisher) DESC
      LIMIT 5;
  `;

  connection.query(query6, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

// Route 7: GET /game_selection/:threshold
const gameSelection = async function (req, res) {
  const threshold = req.params.threshold;
  const query7 = `
    SELECT Gameid, sum(votes),COUNT(votes)
    FROM Review
    GROUP BY Gameid
    HAVING sum(votes) > COUNT(votes)/${threshold}
  `;

  connection.query(query7, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

const random = async function (req, res) {
  const query = `
  SELECT name
  FROM Game
  ORDER BY RAND()
  LIMIT 1
  `
  connection.query(query, (err, data) => {
    if (err){
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
};

const search_games = async function(req, res) {

  const age_low = parseInt(req.query.age_low ?? 0);
  const age_high = parseInt(req.query.age_high ?? 26);
  const price_low = parseFloat(req.query.price_low ?? 0);
  const price_high = parseFloat(req.query.price_high ?? 999);
  const hoursPlayed_low = parseInt(req.query.hoursPlayed_low ?? 0);
  const hoursPlayed_high = parseInt(req.query.hoursPlayed_high ?? 999);

  console.log(age_low);
  console.log(age_high);
  console.log(price_low);
  console.log(price_high);
  console.log(hoursPlayed_low);
  console.log(hoursPlayed_high);


  const title = req.query.title ?? '';

  const explicit = req.query.explicit === 'true' ? 1 : 0;


  connection.query(`
  SELECT DISTINCT G.id, G.name, G.price, TIMESTAMPDIFF(YEAR, G.releaseDate, current_date)AS age
  From Game G LEFT JOIN Recommendation R on G.id = R.GameID
  WHERE G.price BETWEEN ${price_low} AND ${price_high}
  AND TIMESTAMPDIFF(YEAR, G.releaseDate, current_date) BETWEEN ${age_low} AND ${age_high}
  AND R.hoursPlayed BETWEEN ${hoursPlayed_low} AND ${hoursPlayed_high}
  `, (err, data) => {
    if (err){
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });

}



module.exports = {
  games,
  random,
  search_games,
  popularGames,
  newGames,
  reviewsCount,
  positiveRecommendations,
  topDevelopers,
  getGameFromDeveloper,
  getReviewFromGameID,
  topPublishers,
  gameSelection
};