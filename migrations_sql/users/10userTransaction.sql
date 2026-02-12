/* 

wallet_transactions
--------------------------------
pkTransactionId (BIGINT PK)
fkUserId (BIGINT)
transactionType (ENUM)
amount (DECIMAL 12,2)

openingBalance (DECIMAL 12,2)
closingBalance (DECIMAL 12,2)

referenceId (BIGINT)
referenceType (VARCHAR)

status (ENUM)
note (VARCHAR)

createdAt (DATETIME)

INDEX (fkUserId)
INDEX (referenceId, referenceType)

 */


/* 
transaction Type
DEPOSIT
WITHDRAW
BET_DEBIT
BET_WIN
REFUND
BONUS
PENALTY
ADMIN_ADJUSTMENT

status:
PENDING
SUCCESS
FAILED
REVERSED

 */


CREATE TABLE IF NOT EXISTS wallet_transactions (
  transactionId BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT,
  transactionType ENUM('DEPOSIT', 'WITHDRAW', 'BET_DEBIT', 'BET_WIN', 'REFUND', 'BONUS', 'PENALTY', 'ADMIN_ADJUSTMENT'),
  amount DECIMAL(12,2),
  openingBalance DECIMAL(12,2),
  closingBalance DECIMAL(12,2),
  referenceId BIGINT,
  referenceType VARCHAR(255),
  status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REVERSED'),
  note VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);