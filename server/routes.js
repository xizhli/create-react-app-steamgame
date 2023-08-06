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
WITH randomMedia as (
    SELECT GameID, Screenshots, Movies FROM Media
    WHERE GameID >= RAND() * (SELECT MAX(GameID) FROM Media)
LIMIT 28)
SELECT id, name, Screenshots, Movies FROM randomMedia RM
LEFT JOIN Game G on G.id = RM.GameID;
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
    SELECT GameID, SUM(recommended) as sumRecommended, COUNT(recommended) as countRecommended
    FROM Recommendation GROUP BY GameID HAVING sumRecommended > countRecommended * 0.8)
SELECT Developer
FROM recommended_games R LEFT JOIN Creator C ON R.GameID = C.GameID
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
WITH devGames AS (
    SELECT DISTINCT id, name FROM Game G
    LEFT JOIN Creator C on G.id = C.GameID WHERE Developer = '${Developer}'
),
gameRecs AS (
    SELECT GameID, SUM(hoursPlayed) as TotalHoursPlayed, SUM(funny) as NumOfThumbsUp FROM Recommendation
    WHERE GameID IN (SELECT id FROM devGames)
    GROUP BY GameID
)
SELECT id, name, Screenshots, Movies, IFNULL(TotalHoursPlayed,0) as TotalHoursPlayed, IFNULL(NumOfThumbsUp,0) as NumOfThumbsUp FROM devGames
LEFT JOIN Media M ON M.GameID = id
LEFT JOIN gameRecs GR ON GR.GameID = id
ORDER BY TotalHoursPlayed DESC;
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
  //const hoursPlayed_low = parseInt(req.query.hoursPlayed_low ?? 0);
  //const hoursPlayed_high = parseInt(req.query.hoursPlayed_high ?? 999);
  const include_recommendation = req.query.include_recommendation === 'true' ? 1 : 0;
  const include_reviews = req.query.include_reviews === 'true' ? 1: 0;
  //const recBool = req.query.recBool ?? 0;
  //const revBool = req.query.revBool ?? 0;
  const gameName = req.query.gameName ?? '';

  const recThres = req.query.rec_threshold ?? 0.8;
  const revThres = req.query.rev_threshold ?? 0.5;

  /* //For checking if values are passed on
  console.log(age_low);
  console.log(age_high);
  console.log(price_low);
  console.log(price_high);
  console.log(hoursPlayed_low);
  console.log(hoursPlayed_high);
  console.log(include_recommendation);
  console.log(include_reviews);
  console.log(recBool);
  console.log(revBool);
  console.log(gameName);
  */

  if (!include_reviews && !include_recommendation){
    if (!gameName){
    connection.query(`
    SELECT DISTINCT G.id, G.name
    From Game G 
    WHERE G.price BETWEEN ${price_low} AND ${price_high}
    AND TIMESTAMPDIFF(YEAR, G.releaseDate, current_date) BETWEEN ${age_low} AND ${age_high}
    `, (err, data) => {
      if (err){
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }})} else{
        connection.query(`
        SELECT DISTINCT G.id, G.name
        From Game G 
        WHERE G.price BETWEEN ${price_low} AND ${price_high}
        AND TIMESTAMPDIFF(YEAR, G.releaseDate, current_date) BETWEEN ${age_low} AND ${age_high}
        AND G.name LIKE '%${gameName}%'
        `, (err, data) => {
          if (err){
            console.log(err);
            res.json([]);
          } else {
            res.json(data);
          }})
      }

  
  } else if (include_recommendation && !include_reviews){

    connection.query(`
      SELECT G.id, G.name
      FROM Game G JOIN Recommendation R on G.id = R.GameID
      GROUP BY G.id, G.name
      HAVING SUM(R.recommended) > COUNT(R.recommended)*${recThres};
    `, (err, data) => {
      if (err){
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }})
  } else if (!include_recommendation && include_reviews){

    connection.query(`
    SELECT G.id, G.name
    FROM Game G JOIN Review R on G.id = R.GameID
    GROUP BY G.id, G.name
    HAVING SUM(R.score) > COUNT(R.score)*${revThres};
  `, (err, data) => {
    if (err){
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }})

  } else{ //Take route 1, run 6 minutes
    connection.query(`
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
      SELECT DTG.Developer,DTG.GameID, G.name, AVG(G.price) as average_price,
      AVG(R.score) as average_score, AVG(DPG.recommend_count) as
      average_recommend_count
      FROM dev_top_games DTG
      JOIN Game G ON DTG.GameID = G.id
      JOIN Review R ON G.id = R.GameID
      JOIN dev_popular_games DPG ON DTG.GameID = DPG.GameID AND
      DTG.Developer = DPG.Developer
      GROUP BY DTG.Developer
    )
    SELECT GameID, name FROM dev_game_avg_stats;
    `, (err, data) => {
      if (err){
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    })
  }

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