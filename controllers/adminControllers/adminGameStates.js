
const validStates = ["Upcoming", "Live", "Pending", "Declared", "Closed"];

// Mapping to flags (kept for backward-compatibility)
const statesMap = {
  Live: {
    showInLive: 1,
    showInPending: 0,
    showInDeclared: 0,
    showInUpcoming: 0,
  },
  Pending: {
    showInLive: 0,
    showInPending: 1,
    showInDeclared: 0,
    showInUpcoming: 0,
  },
  Declared: {
    showInLive: 0,
    showInPending: 0,
    showInDeclared: 1,
    showInUpcoming: 0,
  },
  Upcoming: {
    showInLive: 0,
    showInPending: 0,
    showInDeclared: 0,
    showInUpcoming: 1,
  },
  Closed: {
    showInLive: 0,
    showInPending: 0,
    showInDeclared: 0,
    showInUpcoming: 0,
  }, // holiday/closed
};

function isValidDateYYYYMMDD(d) {
  if (!d || typeof d !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const dt = new Date(d + "T00:00:00Z");
  return !isNaN(dt.getTime());
}

// need to read this code 

// ======================= create game States =========================
exports.createGameStates = async (req, res) => {
  try {
    let gameId = req.params.gameId;
    let { gameDate, gameState } = req.body;

    if (!gameId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide game id" });
    }
    gameId = Number(gameId);
    if (isNaN(gameId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid game id" });
    }

    if (!gameDate || !gameState) {
      return res
        .status(400)
        .json({
          status: false,
          message: "please provide all required fields: gameDate, gameState",
        });
    }

    if (!isValidDateYYYYMMDD(gameDate)) {
      return res
        .status(400)
        .json({
          status: false,
          message: "please provide valid date in YYYY-MM-DD format",
        });
    }

    
    if (!validStates.includes(gameState)) {
      return res
        .status(400)
        .json({
          status: false,
          message: `please provide valid game state. allowed: ${validStates.join(", ")}`,
        });
    }

    // check game exists
    const [checkGame] = await global.db.query(
      "SELECT id FROM games WHERE id = ?",
      [gameId],
    );
    if (checkGame.length === 0) {
      return res.status(404).json({ status: false, message: "game not found" });
    }

    // check holiday override

    const [holidayRows] = await global.db.query(
      "SELECT isHoliday FROM game_calendar WHERE gameId = ? AND gameDate = ?",
      [gameId, gameDate],
    );

    if (holidayRows.length > 0 && Number(holidayRows[0].isHoliday) === 1) {
      // override to Closed
      gameState = "Closed";
    }

    // duplicate check (gameId + gameDate unique)
    const [checkDuplicate] = await global.db.query(
      "SELECT stateId FROM game_states WHERE gameId = ? AND gameDate = ?",
      [gameId, gameDate],
    );
    if (checkDuplicate.length > 0) {
      return res
        .status(409)
        .json({
          status: false,
          message: "game state for this game on this date already exists",
        });
    }

    // prepare flags from state
    const flags = statesMap[gameState] || {
      showInLive: 0,
      showInPending: 0,
      showInDeclared: 0,
      showInUpcoming: 0,
    };

    const [createState] = await global.db.query(
      `INSERT INTO game_states 
        (gameId, gameDate, gameState, showInLive, showInPending, showInDeclared, showInUpcoming)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        gameId,
        gameDate,
        gameState,
        flags.showInLive,
        flags.showInPending,
        flags.showInDeclared,
        flags.showInUpcoming,
      ],
    );

    if (!createState || createState.affectedRows === 0) {
      return res
        .status(500)
        .json({ status: false, message: "failed to create game state" });
    }

    return res.status(201).json({
      status: true,
      message: "game state created successfully",
      data: { stateId: createState.insertId, gameId, gameDate, gameState },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ========================== Update Game States ==========================
exports.updateGameStates = async (req, res) => {
  try {
    let stateId = req.params.stateId;
    let {
      gameDate,
      gameState,
      showInLive,
      showInPending,
      showInDeclared,
      showInUpcoming,
    } = req.body;

    if (!stateId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide state id" });
    }
    stateId = Number(stateId);
    if (isNaN(stateId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid state id" });
    }

    // fetch existing state
    const [existingRows] = await global.db.query(
      "SELECT * FROM game_states WHERE stateId = ?",
      [stateId],
    );
    if (existingRows.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "game state not found" });
    }
    const existing = existingRows[0];
    const gameId = existing.gameId;

    // validate incoming gameState if provided
    if (gameState && !validStates.includes(gameState)) {
      return res
        .status(400)
        .json({
          status: false,
          message: `please provide valid game state. allowed: ${validStates.join(", ")}`,
        });
    }

    if (gameDate && !isValidDateYYYYMMDD(gameDate)) {
      return res
        .status(400)
        .json({
          status: false,
          message: "please provide valid date in YYYY-MM-DD format",
        });
    }

    // if updating date, check holiday override for that new date
    let finalGameDate = gameDate || existing.gameDate;
    // check holiday for finalGameDate
    const [holidayRows] = await global.db.query(
      "SELECT isHoliday FROM game_calendar WHERE gameId = ? AND gameDate = ?",
      [gameId, finalGameDate],
    );
    if (holidayRows.length > 0 && Number(holidayRows[0].isHoliday) === 1) {
      // override to Closed regardless of provided gameState/flags
      gameState = "Closed";
    }

    // duplicate check: ensure no other row with same (gameId, gameDate)
    const [checkDuplicate] = await global.db.query(
      "SELECT stateId FROM game_states WHERE gameId = ? AND gameDate = ? AND stateId != ?",
      [gameId, finalGameDate, stateId],
    );
    if (checkDuplicate.length > 0) {
      return res
        .status(409)
        .json({
          status: false,
          message: "game state for this game on this date already exists",
        });
    }

    // compute flags: if client provided explicit flags and NOT changing state, use provided;
    // if client changed gameState, derive flags from statesMap
    let finalFlags = {
      showInLive: existing.showInLive,
      showInPending: existing.showInPending,
      showInDeclared: existing.showInDeclared,
      showInUpcoming: existing.showInUpcoming,
    };

    if (gameState) {
      // override flags from gameState (recommended)
      const fromMap = statesMap[gameState] || {
        showInLive: 0,
        showInPending: 0,
        showInDeclared: 0,
        showInUpcoming: 0,
      };
      finalFlags = { ...fromMap };
    } else {
      // no gameState change: allow explicit flags if provided (number coercion)
      if (typeof showInLive !== "undefined")
        finalFlags.showInLive = Number(showInLive) ? 1 : 0;
      if (typeof showInPending !== "undefined")
        finalFlags.showInPending = Number(showInPending) ? 1 : 0;
      if (typeof showInDeclared !== "undefined")
        finalFlags.showInDeclared = Number(showInDeclared) ? 1 : 0;
      if (typeof showInUpcoming !== "undefined")
        finalFlags.showInUpcoming = Number(showInUpcoming) ? 1 : 0;
    }

    // now perform update
    const [updateResult] = await global.db.query(
      `UPDATE game_states
         SET gameDate = COALESCE(?, gameDate),
             gameState = COALESCE(?, gameState),
             showInLive = ?,
             showInPending = ?,
             showInDeclared = ?,
             showInUpcoming = ?,
             updatedAt = CURRENT_TIMESTAMP
       WHERE stateId = ?`,
      [
        gameDate,
        gameState,
        finalFlags.showInLive,
        finalFlags.showInPending,
        finalFlags.showInDeclared,
        finalFlags.showInUpcoming,
        stateId,
      ],
    );

    if (!updateResult || updateResult.affectedRows === 0) {
      return res
        .status(500)
        .json({ status: false, message: "failed to update game state" });
    }

    return res
      .status(200)
      .json({ status: true, message: "game state updated successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ======================= get game State by id =========================
exports.getGameStateById = async (req, res) => {
  try {
    let stateId = req.params.stateId;
    if (!stateId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide state id" });
    }
    stateId = Number(stateId);
    if (isNaN(stateId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid state id" });
    }

    const [rows] = await global.db.query(
      `SELECT gs.*, g.gameName, g.gameCode 
         FROM game_states gs
         JOIN games g ON gs.gameId = g.id
         WHERE gs.stateId = ?`,
      [stateId],
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "game state not found" });
    }

    return res.status(200).json({ status: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =================== get all game states =======================
exports.getAllGameStates = async (req, res) => {
  try {
    const [rows] = await global.db.query(
      `SELECT gs.*, g.gameName, g.gameCode 
         FROM game_states gs
         JOIN games g ON gs.gameId = g.id
         ORDER BY gs.gameDate DESC, gs.stateId DESC`,
    );
    return res.status(200).json({ status: true, data: rows });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =========================== Delete Game States =========================
exports.deleteGameStates = async (req, res) => {
  try {
    let stateId = req.params.stateId;
    if (!stateId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide state id" });
    }
    stateId = Number(stateId);
    if (isNaN(stateId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid state id" });
    }

    const [deleteResult] = await global.db.query(
      "DELETE FROM game_states WHERE stateId = ?",
      [stateId],
    );
    if (!deleteResult || deleteResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: false, message: "game state not found" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Game state deleted successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
