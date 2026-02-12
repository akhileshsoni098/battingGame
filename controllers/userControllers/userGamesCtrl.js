

exports.getAllGamesUser = async (req, res) => {
  try {

    const [games] = await global.db.query(`
      
SELECT 

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

-- CURRENT
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

-- DECLARED
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

-- UPCOMING
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

WHERE g.isActive = 1

ORDER BY gt.startTime ASC

    `);

    // convert undefined → null
    const formatted = games.map(game =>
      Object.fromEntries(
        Object.entries(game).map(([k, v]) => [k, v ?? null])
      )
    );

    res.status(200).json({
      status: true,
      count: formatted.length,
      data: formatted
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
};


