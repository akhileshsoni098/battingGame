/* 

bets
-------------------------
pkBetId (BIGINT PK)

fkUserId (BIGINT)
fkGameId (BIGINT)

gameDate (DATE)

betNumber (VARCHAR)
amount (DECIMAL 12,2)

betStatus (ENUM)

winAmount (DECIMAL 12,2)

createdAt

INDEX (fkUserId)
INDEX (fkGameId, gameDate)

betStatus:
PLACED
WON
LOST
CANCELLED
REFUNDED

 */



 /* 
 ye game ke result pr depend krega 
  */

CREATE TABLE IF NOT EXISTS bets (
  betId BIGINT AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT,
    gameId INT,
    gameDate DATE,
    betNumber VARCHAR(255),
    amount DECIMAL(12,2),
    betStatus ENUM('PLACED', 'WON', 'LOST', 'CANCELLED', 'REFUNDED') DEFAULT 'PLACED',
    winAmount DECIMAL(12,2) DEFAULT 0.00,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
  FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
