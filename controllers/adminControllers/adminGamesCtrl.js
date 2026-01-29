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
