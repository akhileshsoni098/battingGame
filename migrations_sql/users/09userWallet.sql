/* 
user_wallets
-------------------------
pkWalletId (BIGINT PK)
fkUserId (BIGINT UNIQUE)
depositBalance (DECIMAL 12,2)
bonusBalance (DECIMAL 12,2)
winningBalance (DECIMAL 12,2)
totalBalance (DECIMAL 12,2)
updatedAt (DATETIME)
 */
 

 CREATE TABLE IF NOT EXISTS user_wallets (
  walletId BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT UNIQUE,
  depositBalance DECIMAL(12,2) DEFAULT 0.00,
  bonusBalance DECIMAL(12,2) DEFAULT 0.00,
  winningBalance DECIMAL(12,2) DEFAULT 0.00,
  totalBalance DECIMAL(12,2) AS (depositBalance + bonusBalance + winningBalance) STORED,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE

);