
CREATE TABLE IF NOT EXISTS game_timings(

  timingId INT AUTO_INCREMENT PRIMARY KEY,

  gameId INT NOT NULL UNIQUE,

  startTime    TIME NOT NULL,
  endTime      TIME NOT NULL,
  resultTime   TIME NOT NULL,

  startDayDiff TINYINT NOT NULL DEFAULT 0, 
  endDayDiff   TINYINT NOT NULL DEFAULT 0,

  createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (gameId) REFERENCES games(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE

);


/* 
==========Meaning of startDayDiff and endDayDiff==========

startDayDiff-
endDayDiff-
 0 - same day, 1 - next day, 2 - day after next
 `startDayDiff`, `endDayDiff` to handle timings that cross midnight`

    For example, if a game starts at 10:00 PM and ends at 2:00 AM the next day,
    `startDayDiff` would be 0 (same day) and `endDayDiff` would be 1 (next day).

    This allows for accurate representation of game timings that span across two days.
 */