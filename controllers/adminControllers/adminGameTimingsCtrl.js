//======================= create game timing =========================

exports.createGameTiming = async (req, res) => {
  try {
    let gameId = req.params.gameId;

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

    let { startTime, endTime, resultTime, startDayDiff, endDayDiff } = req.body;

    const requiredFields = { startTime, endTime, resultTime };

    for (const field in requiredFields) {
      if (!requiredFields[field]) {
        return res.status(400).json({
          status: false,
          message: `${field} is required`,
        });
      }
    }

    // check game is exist
    const [gameExist] = await global.db.query(
      "SELECT * FROM games WHERE id = ?",
      [gameId],
    );
    if (gameExist.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Game with the provided gameId does not exist",
      });
    }

    // check unique gameId
    const [existingTiming] = await global.db.query(
      "SELECT * FROM game_timings WHERE gameId = ?",
      [gameId],
    );

    if (existingTiming.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Game timing for this gameId already exists",
      });
    }
    const [createTiming] = await global.db.query(
      "INSERT INTO game_timings (gameId, startTime, endTime, resultTime, startDayDiff, endDayDiff) VALUES (?, ?, ?, ?, ?, ?)",
      [
        gameId,
        startTime,
        endTime,
        resultTime,
        startDayDiff || 0,
        endDayDiff || 0,
      ],
    );

    if (!createTiming.affectedRows) {
      return res.status(400).json({
        status: false,
        message: "There is some issue in creating game timing",
      });
    }

    res.status(201).json({
      status: true,
      message: "Game timing created Successfully",
      data: createTiming,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ======================= update game timing =========================

exports.updateGameTiming = async (req, res) => {
  try {
    let timingId = req.params.timingId;
    if (!timingId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide timing id" });
    }

    timingId = Number(timingId);
    if (isNaN(timingId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid timing id" });
    }

    let { startTime, endTime, resultTime, startDayDiff, endDayDiff } = req.body;
    const requiredFields = { startTime, endTime, resultTime };

    for (const field in requiredFields) {
      if (!requiredFields[field]) {
        return res.status(400).json({
          status: false,
          message: `${field} is required`,
        });
      }
    }

    // check unique gameId not equels to current id

    // const [existingTiming] = await global.db.query(
    //   "SELECT * FROM game_timings WHERE gameId = ? AND timingId != ?",
    //   [gameId, timingId],
    // );

    // if (existingTiming.length > 0) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Game timing for this gameId already exists",
    //   });
    // }

    const [updateTiming] = await global.db.query(
      "UPDATE game_timings SET startTime = ?, endTime = ?, resultTime = ?, startDayDiff = ?, endDayDiff = ? WHERE timingId = ?",
      [
        startTime,
        endTime,
        resultTime,
        startDayDiff || 0,
        endDayDiff || 0,
        timingId,
      ],
    );
    if (!updateTiming.affectedRows) {
      return res.status(400).json({
        status: false,
        message: "There is some issue in updating game timing",
      });
    }
    res.status(201).json({
      status: true,
      message: "Game timing updated Successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ======================= get all game timings with gameId join gameId

exports.getGameTimings = async (req, res) => {
  try {
    const [timings] = await global.db.query(
      `SELECT gt.*, g.gameName, g.gameCode FROM game_timings gt
       JOIN games g ON gt.gameId = g.id`,
    );
    res.status(200).json({
      status: true,
      data: timings,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ======================= get Single game timing by gameId

exports.getGameTimingById = async (req, res) => {
  try {
    let timingId = req.params.timingId;
    if (!timingId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide timing id" });
    }

    timingId = Number(timingId);
    if (isNaN(timingId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid timing id" });
    }
    const [timing] = await global.db.query(
      `SELECT gt.*, g.gameName, g.gameCode FROM game_timings gt
       JOIN games g ON gt.gameId = g.id
       WHERE gt.timingId = ?`,
      [timingId],
    );
    res.status(200).json({
      status: true,
      data: timing,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ======================= delete game timing =========================

exports.deleteGameTiming = async (req, res) => {
  try {
    let timingId = req.params.timingId;
    if (!timingId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide timing id" });
    }

    timingId = Number(timingId);
    if (isNaN(timingId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid timing id" });
    }
    const [deleteTiming] = await global.db.query(
      "DELETE FROM game_timings WHERE timingId = ?",
      [timingId],
    );
    if (deleteTiming.affectedRows == 0) {
      return res
        .status(404)
        .json({ status: false, message: "game timing not found" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Game timing deleted successfully" });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
