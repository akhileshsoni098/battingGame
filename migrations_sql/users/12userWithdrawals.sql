/* 
withdraw_requests
-------------------------
pkWithdrawId (BIGINT PK)
fkUserId (BIGINT)

amount (DECIMAL 12,2)

upiId (VARCHAR)
bankName (VARCHAR)
accountNumber (VARCHAR)
ifsc (VARCHAR)

status (ENUM)

approvedBy (BIGINT)
approvedAt (DATETIME)

createdAt
updatedAt

INDEX (fkUserId)
status: PENDING
APPROVED
REJECTED
PROCESSING
PAID

 */

CREATE TABLE IF NOT EXISTS withdraw_requests (
  withdrawId BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT,
  amount DECIMAL(12,2),
  upiId VARCHAR(255),
  bankName VARCHAR(255),
  accountNumber VARCHAR(255),
  ifsc VARCHAR(255),
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'PAID') DEFAULT 'PENDING',
  approvedBy BIGINT,
  approvedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE

);