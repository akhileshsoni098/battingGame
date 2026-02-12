//==================  create game result ==============================

exports.createGameResult = async (req, res) => {
  try {
    let gameId = req.params.gameId;
    let { gameDate, result } = req.body;

    if (!gameId) {
      return res.status(400).json({
        status: false,
        message: "please provide game id",
      });
    }

    gameId = Number(gameId);

    if (isNaN(gameId)) {
      return res.status(400).json({
        status: false,
        message: "please provide valid game id",
      });
    }

    if (!gameDate || !result) {
      return res.status(400).json({
        status: false,
        message: "please provide gameDate and result",
      });
    }

    // check game exists
    const [game] = await global.db.query("SELECT id FROM games WHERE id = ?", [
      gameId,
    ]);

    if (game.length === 0) {
      return res.status(404).json({
        status: false,
        message: "game not found",
      });
    }

    // duplicate check
    const [existing] = await global.db.query(
      "SELECT resultId FROM game_results WHERE gameId = ? AND gameDate = ?",
      [gameId, gameDate],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: false,
        message: "result already exists for this game on this date",
      });
    }

    // fetch previous result 🔥
    const [prev] = await global.db.query(
      `SELECT result FROM game_results
       WHERE gameId = ?
       ORDER BY gameDate DESC
       LIMIT 1`,
      [gameId],
    );

    const previousResult = prev.length ? prev[0].result : null;

    const [createResult] = await global.db.query(
      `INSERT INTO game_results
       (gameId, gameDate, result, previousResult)
       VALUES (?, ?, ?, ?)`,
      [gameId, gameDate, result, previousResult],
    );

    return res.status(201).json({
      status: true,
      message: "Game result created successfully",
      data: { resultId: createResult.insertId },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// ================================ update ===============================

exports.updateGameResult = async (req, res) => {
  try {
    let resultId = req.params.resultId;
    let { gameDate, result } = req.body;

    if (!resultId) {
      return res.status(400).json({
        status: false,
        message: "please provide result id",
      });
    }

    resultId = Number(resultId);

    if (isNaN(resultId)) {
      return res.status(400).json({
        status: false,
        message: "please provide valid result id",
      });
    }

    if (!gameDate && !result) {
      return res.status(400).json({
        status: false,
        message: "please provide at least one field to update",
      });
    }

    let updateFields = [];
    let updateValues = [];

    if (gameDate) {
      updateFields.push("gameDate = ?");
      updateValues.push(gameDate);
    }

    if (result) {
      updateFields.push("result = ?");
      updateValues.push(result);
    }

    updateValues.push(resultId);

    const [updateResult] = await global.db.query(
      `UPDATE game_results 
       SET ${updateFields.join(", ")}
       WHERE resultId = ?`,
      updateValues,
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "game result not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Game result updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// ======================= get game result by id =========================

exports.getGameResultById = async (req, res) => {
  try {
    let resultId = req.params.resultId;

    if (!resultId) {
      return res.status(400).json({
        status: false,
        message: "please provide result id",
      });
    }

    resultId = Number(resultId);

    if (isNaN(resultId)) {
      return res.status(400).json({
        status: false,
        message: "please provide valid result id",
      });
    }

    const [result] = await global.db.query(
      `SELECT gr.*, g.gameName, g.gameCode
       FROM game_results gr
       JOIN games g ON gr.gameId = g.id
       WHERE gr.resultId = ?`,
      [resultId],
    );

    if (result.length === 0) {
      return res.status(404).json({
        status: false,
        message: "game result not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// ======================= get all game results =========================

exports.getGameResults = async (req, res) => {
  try {
    const [results] = await global.db.query(
      `SELECT gr.*, g.gameName, g.gameCode
       FROM game_results gr
       JOIN games g ON gr.gameId = g.id
       ORDER BY gr.gameDate DESC`,
    );

    return res.status(200).json({
      status: true,
      data: results,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// ======================= delete game result =========================

exports.deleteGameResult = async (req, res) => {
  try {
    let resultId = req.params.resultId;

    if (!resultId) {
      return res.status(400).json({
        status: false,
        message: "please provide result id",
      });
    }

    resultId = Number(resultId);

    if (isNaN(resultId)) {
      return res.status(400).json({
        status: false,
        message: "please provide valid result id",
      });
    }

    const [deleteResult] = await global.db.query(
      "DELETE FROM game_results WHERE resultId = ?",
      [resultId],
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        status: false,
        message: "game result not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Game result deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
