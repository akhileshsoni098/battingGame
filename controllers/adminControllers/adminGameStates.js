// ======================= create game States =========================

exports.createGameStates = async (req, res) => {
  try {
    let gameId = req.params.gameId;
    let {
      gameDate,
      gameState,
      showInLive,
      showInPending,
      showInDeclared,
      showInUpcoming,
    } = req.body;

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
        .json({ status: false, message: "please provide all required fields" });
    }

    const validState = ["Live", "Pending", "Declared", "Upcoming"];

    if (!validState.includes(gameState)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid game state" });
    }

    const statesObj = {
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
    };

    const checkGame = await global.db.query(
      "SELECT * FROM games WHERE id = ?",
      [gameId],
    );

    if (checkGame[0].length == 0) {
      return res.status(404).json({ status: false, message: "game not found" });
    }

    const [checkDuplicateState] = await global.db.query(
      "SELECT * FROM game_states WHERE gameId = ? AND gameDate = ?",
      [gameId, gameDate],
    );

    if (checkDuplicateState.length > 0) {
      return res.status(409).json({
        status: false,
        message: "game state for this game on this date already exists",
      });
    }

    const [createState] = await global.db.query(
      "INSERT INTO game_states (gameId, gameDate, gameState, showInLive, showInPending, showInDeclared, showInUpcoming) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        gameId,
        gameDate,
        gameState,
        statesObj[gameState].showInLive || 0,
        statesObj[gameState].showInPending || 0,
        statesObj[gameState].showInDeclared || 0,
        statesObj[gameState].showInUpcoming || 0,
      ],
    );

    // if not created
    if (createState.affectedRows == 0) {
      return res
        .status(500)
        .json({ status: false, message: "failed to create game state" });
    }
    return res.status(201).json({
      status: true,
      message: "game state created successfully",
      data: { stateId: createState.insertId },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//==========================Update Game States ==========================

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
    const [checkState] = await global.db.query(
      "SELECT * FROM game_states WHERE stateId = ?",
      [stateId],
    );
    if (checkState.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "game state not found" });
    }

    const validState = ["Live", "Pending", "Declared", "Upcoming"];
    if (gameState && !validState.includes(gameState)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid game state" });
    }

    const statesObj = {
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
    };

    const [checkDuplicateState] = await global.db.query(
      "SELECT * FROM game_states WHERE gameId = ? AND gameDate = ? AND stateId != ?",
      [gameId, gameDate, stateId],
    );

    if (checkDuplicateState.length > 0) {
      return res.status(409).json({
        status: false,
        message: "game state for this game on this date already exists",
      });
    }

    const [updateState] = await global.db.query(
      `UPDATE game_states 
       SET gameDate = COALESCE(?, gameDate),
        
              gameState = COALESCE(?, gameState),
                showInLive = COALESCE(?, showInLive),
                showInPending = COALESCE(?, showInPending),
                showInDeclared = COALESCE(?, showInDeclared),
                showInUpcoming = COALESCE(?, showInUpcoming)
         WHERE stateId = ?`,

      [
        gameDate,
        gameState,
        gameState ? statesObj[gameState].showInLive : showInLive,
        gameState ? statesObj[gameState].showInPending : showInPending,
        gameState ? statesObj[gameState].showInDeclared : showInDeclared,
        gameState ? statesObj[gameState].showInUpcoming : showInUpcoming,
        stateId,
      ],
    );
    if (updateState.affectedRows == 0) {
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

    const [state] = await global.db.query(
      `SELECT gs.*, g.gameName, g.gameCode FROM game_states gs
       JOIN games g ON gs.gameId = g.id
       WHERE gs.stateId = ?`,
      [stateId],
    );

    if (state.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "game state not found" });
    }

    res.status(200).json({
      status: true,
      data: state,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//=================== get all game states =======================

exports.getAllGameStates = async (req, res) => {
  try {
    const [states] = await global.db.query(
      `SELECT gs.*, g.gameName, g.gameCode FROM game_states gs
       JOIN games g ON gs.gameId = g.id
       ORDER BY gs.stateId DESC`,
    );
    res.status(200).json({
      status: true,
      data: states,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//=========================== Delete Game States =========================

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

    const [deleteState] = await global.db.query(
      "DELETE FROM game_states WHERE stateId = ?",
      [stateId],
    );
    if (deleteState.affectedRows == 0) {
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
