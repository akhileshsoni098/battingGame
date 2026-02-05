//==================  create game calender ==============================

exports.createGameCalendar = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    let { gameDate, isHoliday } = req.body;

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

    if (!gameDate) {
      return res
        .status(400)
        .json({ status: false, message: "please provide game date" });
    }

    if (isHoliday !== undefined) {
      if (typeof isHoliday !== "boolean") {
        return res.status(400).json({
          status: false,
          message: "isHoliday must be a boolean value",
        });
      }

      isHoliday = isHoliday ? 1 : 0;
    } else {
      isHoliday = 0; 
    }
    const [existingCalendar] = await global.db.query(
      "SELECT * FROM game_calendar WHERE gameId = ? AND gameDate = ?",
      [gameId, gameDate],
    );
    if (existingCalendar.length > 0) {
      return res.status(409).json({
        status: false,
        message:
          "Game calendar already exists for this game on the specified date",
      });
    }
    const [createCalendar] = await global.db.query(
      "INSERT INTO game_calendar (gameId, gameDate, isHoliday) VALUES (?, ?, ?)",
      [gameId, gameDate, isHoliday],
    );
    if (createCalendar.affectedRows == 0) {
      return res
        .status(500)
        .json({ status: false, message: "Failed to create game calendar" });
    }
    return res.status(201).json({
      status: true,
      message: "Game calendar created successfully",
      data: { calendarId: createCalendar.insertId },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ================================ update ===============================

exports.updateGameCalendar = async (req, res) => {
  try {
    let calendarId = req.params.calendarId;
    let { gameDate, isHoliday } = req.body;
    if (!calendarId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide calendar id" });
    }
    calendarId = Number(calendarId);
    if (isNaN(calendarId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid calendar id" });
    }
    if (!gameDate && isHoliday === undefined) {
      return res.status(400).json({
        status: false,
        message:
          "please provide at least one field to update (gameDate or isHoliday)",
      });
    }

    let updateFields = [];
    let updateValues = [];

    if (gameDate) {
      updateFields.push("gameDate = ?");
      updateValues.push(gameDate);
    }
    if (isHoliday !== undefined) {
      if (typeof isHoliday !== "boolean") {
        return res.status(400).json({
          status: false,
          message: "isHoliday must be a boolean value",
        });
      }
      isHoliday = isHoliday ? 1 : 0;
      updateFields.push("isHoliday = ?");
      updateValues.push(isHoliday);
    }
    updateValues.push(calendarId);
    const [updateCalendar] = await global.db.query(
      `UPDATE game_calendar SET ${updateFields.join(", ")} WHERE calendarId = ?`,
      updateValues,
    );
    if (updateCalendar.affectedRows == 0) {
      return res
        .status(500)
        .json({ status: false, message: "Failed to update game calendar" });
    }
    return res.status(200).json({
      status: true,
      message: "Game calendar updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
// ======================= get game calendar by id =========================

exports.getGameCalendarById = async (req, res) => {
  try {
    let calendarId = req.params.calendarId;
    if (!calendarId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide calendar id" });
    }
    calendarId = Number(calendarId);
    if (isNaN(calendarId)) {
      return res

        .status(400)
        .json({ status: false, message: "please provide valid calendar id" });
    }
    const [calendar] = await global.db.query(
      "SELECT gc.*, g.gameName, g.gameCode FROM game_calendar gc JOIN games g ON gc.gameId = g.id WHERE gc.calendarId = ?",
      [calendarId],
    );
    if (calendar.length == 0) {
      return res
        .status(404)
        .json({ status: false, message: "game calendar not found" });
    }
    return res.status(200).json({
      status: true,
      data: calendar,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ======================= get all game calendar with gameId join gameId =========================
exports.getGameCalendars = async (req, res) => {
  try {
    const [calendars] = await global.db.query(
      "SELECT gc.*, g.gameName, g.gameCode FROM game_calendar gc JOIN games g ON gc.gameId = g.id",
    );
    return res.status(200).json({
      status: true,
      data: calendars,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ======================= delete game calendar by calendarId =========================

exports.deleteGameCalendar = async (req, res) => {
  try {
    let calendarId = req.params.calendarId;

    if (!calendarId) {
      return res
        .status(400)
        .json({ status: false, message: "please provide calendar id" });
    }

    calendarId = Number(calendarId);

    if (isNaN(calendarId)) {
      return res
        .status(400)
        .json({ status: false, message: "please provide valid calendar id" });
    }

    const [deleteCalendar] = await global.db.query(
      "DELETE FROM game_calendar WHERE calendarId = ?",
      [calendarId],
    );
    if (deleteCalendar.affectedRows == 0) {
      return res
        .status(404)
        .json({ status: false, message: "game calendar not found" });
    }
    return res.status(200).json({
      status: true,
      message: "Game calendar deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
