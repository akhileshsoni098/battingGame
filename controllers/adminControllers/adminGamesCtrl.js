exports.createGames = async (req, res) => {
  try {
    let data = req.body;

    let {
      gameCode,
      gameName,
      gameIcon,
      description,
      holiday,
      isActive,
      isMaster,
    } = data;

    const requiredFields = {
      gameCode,
      gameName,
      gameIcon,
      description,
      holiday,
      isActive,
    };

    for (let key in requiredFields) {
      if (
        requiredFields[key] === undefined ||
        requiredFields[key] === null ||
        requiredFields[key] === ""
      ) {
        return res.status(400).json({
          status: false,
          message: `${key} is required`,
        });
      }
    }

    // check unique   game code game name

    const [check] = await global.db.query(
      "SELECT * FROM games WHERE gameCode = ? OR gameName = ?",
      [gameCode, gameName],
    );

    if (check.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Game Code or Game Name is already registered",
      });
    }

    const [saveGame] = await global.db.query(
      "INSERT INTO games(gameCode, gameName, gameIcon, description, holiday, isActive, isMaster) VALUES (?,?,?,?,?,?,?)",
      [gameCode, gameName, gameIcon, description, holiday, isActive, isMaster],
    );

    if (!saveGame.affectedRows) {
      return res
        .status(400)
        .json({ status: false, message: "There is some issue in save games" });
    }

    res.status(201).json({
      status: true,
      message: "game Saved Successfully",
      data: saveGame.insertId,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


// will update soon
exports.getAllGames = async (req, res) => {
  try {
    const [games] = await global.db.query("SELECT * FROM games");
    res.status(200).json({ status: true, data: games });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// get game details single

exports.getGameDetails = async (req, res) => {
  try {
    let gameId = Number(req.params.gameId);

    if (!gameId || isNaN(gameId)) {
      return res.status(400).json({
        status: false,
        message: "please provide valid game id",
      });
    }

    const [rows] = await global.db.query(
      `
SELECT 

-- GAME MASTER
g.id AS pkGameId,
g.gameCode AS gameId,
g.gameName,
g.gameIcon,
g.description AS gameDescription,
g.holiday,
g.isActive,
g.isMaster,
g.masterId AS fkMasterId,

-- TIMINGS
gt.startTime,
gt.endTime,
gt.resultTime,
gt.startDayDiff,
gt.endDayDiff,

-- TODAY STATE
gs.showInLive,
gs.showInPending,
gs.showInDeclared,
gs.showInUpcoming,
gs.gameDate,
gs.gameState,

-- TODAY RESULT
gr.result AS gameResultToday,

-- YESTERDAY RESULT
(
 SELECT result 
 FROM game_results 
 WHERE gameId = g.id
 AND gameDate < CURDATE()
 ORDER BY gameDate DESC
 LIMIT 1
) AS gameResultYesterday,

-- CURRENT RESULT
gr.gameDate AS currentGameDate,
gr.result AS currentResult,

(
 SELECT result
 FROM game_results
 WHERE gameId = g.id
 AND gameDate < CURDATE()
 ORDER BY gameDate DESC
 LIMIT 1
) AS currentPreviousResult,

-- DECLARED RESULT (latest)
(
 SELECT gameDate
 FROM game_results
 WHERE gameId = g.id
 ORDER BY gameDate DESC
 LIMIT 1
) AS declaredGameDate,

(
 SELECT result
 FROM game_results
 WHERE gameId = g.id
 ORDER BY gameDate DESC
 LIMIT 1
) AS declaredResult,

(
 SELECT result
 FROM game_results
 WHERE gameId = g.id
 ORDER BY gameDate DESC
 LIMIT 1 OFFSET 1
) AS declaredPreviousResult,

-- UPCOMING (from calendar)
(
 SELECT gameDate
 FROM game_calendar
 WHERE gameId = g.id
 AND gameDate > CURDATE()
 ORDER BY gameDate ASC
 LIMIT 1
) AS upcomingGameDate,

(
 SELECT result
 FROM game_results
 WHERE gameId = g.id
 ORDER BY gameDate DESC
 LIMIT 1
) AS upcomingPreviousResult

FROM games g

LEFT JOIN game_timings gt 
ON gt.gameId = g.id

LEFT JOIN game_states gs
ON gs.gameId = g.id
AND gs.gameDate = CURDATE()

LEFT JOIN game_results gr
ON gr.gameId = g.id
AND gr.gameDate = CURDATE()

WHERE g.id = ?
`,
      [gameId]
    );

    if (!rows.length) {
      return res.status(404).json({
        status: false,
        message: "game not found",
      });
    }

    // convert undefined → null
    const data = Object.fromEntries(
      Object.entries(rows[0]).map(([k, v]) => [k, v ?? null])
    );

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};


// update game

exports.updateGame = async (req, res) => {
  try {
    let data = req.body;
    let gameId = req.params.gameId;
    let {
      gameCode,
      gameName,
      gameIcon,
      description,
      holiday,
      isActive,
      isMaster,
    } = data;

    const requiredFields = {
      gameCode,
      gameName,
      gameIcon,
      description,
      holiday,
      isActive,
      isMaster,
    };

    for (let key in requiredFields) {
      if (
        requiredFields[key] === undefined ||
        requiredFields[key] === null ||
        requiredFields[key] === ""
      ) {
        return res.status(400).json({
          status: false,
          message: `${key} is required`,
        });
      }
    }

    const [check] = await global.db.query(
      "SELECT * FROM games WHERE (gameCode = ? OR gameName = ?) AND id != ?",
      [gameCode, gameName, gameId],
    );

    if (check.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Game Code or Game Name is already registered",
      });
    }

    const [updateGame] = await global.db.query(
      "UPDATE games SET gameCode=?, gameName=?, gameIcon=?, description=?, holiday=?, isActive=?, isMaster=? WHERE id=?",
      [
        gameCode,
        gameName,
        gameIcon,
        description,
        holiday,
        isActive,
        isMaster,
        gameId,
      ],
    );

    if (!updateGame.affectedRows) {
      return res.status(400).json({
        status: false,
        message: "There is some issue in update games",
      });
    }

    res.status(201).json({
      status: true,
      message: "game Updated Successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// delete game

exports.deleteGame = async (req, res) => {
  try {
    let gameId = req.params.gameId;

    gameId = Number(gameId);

    if (isNaN(gameId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid game id" });
    }

    if (!gameId || typeof gameId !== "number") {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid game id" });
    }

    const [deleteGame] = await global.db.query(
      "DELETE FROM games WHERE id = ?",
      [gameId],
    );
 
    if (deleteGame.affectedRows == 0) {
      return res.status(404).json({ status: false, message: "game not found" });
    }
 
    return res
      .status(200)
      .json({ status: false, message: "Game deleted successfuly" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
