function getUserId(req) {
  return req.user && (req.user.id || req.user._id);
}

// helper validators
function isPositiveAmount(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

function isValidStatus(status) {
  return ["PENDING", "SUCCESS", "FAILED", "REFUNDED"].includes(status);
}

function isStringMax(value, max) {
  return typeof value === "string" && value.length <= max;
}

//===================================== TEST DEPOSIT (DIRECT SUCCESS) =======================================

exports.testDeposit = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Unauthenticated",
      });
    }

    const { amount } = req.body;

    if (!isPositiveAmount(amount)) {
      return res.status(400).json({
        status: false,
        message: "Invalid deposit amount",
      });
    }

    const depositAmount = parseFloat(amount);

    // ✅ create fake gateway id
    const gatewayTxnId = `TEST-${Date.now()}`;

    // ✅ ensure wallet exists
    await global.db.query(
      `INSERT INTO user_wallets (userId, depositBalance, bonusBalance, winningBalance)
       SELECT ?,0,0,0 FROM DUAL
       WHERE NOT EXISTS (
         SELECT 1 FROM user_wallets WHERE userId = ?
       )`,
      [userId, userId],
    );

    // ✅ get opening balance
    const [before] = await global.db.query(
      `SELECT 
        (depositBalance + bonusBalance + winningBalance) AS total
       FROM user_wallets
       WHERE userId = ?`,
      [userId],
    );

    const openingBalance = before.length ? parseFloat(before[0].total) : 0;

    // ✅ update wallet
    await global.db.query(
      `UPDATE user_wallets
       SET depositBalance = depositBalance + ?,
           totalBalance = depositBalance + ? + bonusBalance + winningBalance,
           updatedAt = CURRENT_TIMESTAMP
       WHERE userId = ?`,
      [depositAmount, depositAmount, userId],
    );

    // ✅ closing balance
    const [after] = await global.db.query(
      `SELECT 
        (depositBalance + bonusBalance + winningBalance) AS total
       FROM user_wallets
       WHERE userId = ?`,
      [userId],
    );

    const closingBalance = parseFloat(after[0].total);

    // ✅ create deposit record (SUCCESS directly)
    const [deposit] = await global.db.query(
      `INSERT INTO deposits
       (userId, amount, gateway, gatewayTxnId, status)
       VALUES (?, ?, 'TEST', ?, 'SUCCESS')`,
      [userId, depositAmount, gatewayTxnId],
    );

    const depositId = deposit.insertId;

    // ✅ create transaction
    await global.db.query(
      `INSERT INTO wallet_transactions
      (userId, transactionType, amount, openingBalance, closingBalance,
       referenceId, referenceType, status, note)
       VALUES (?, 'DEPOSIT', ?, ?, ?, ?, 'DEPOSIT', 'SUCCESS', 'Test deposit')`,
      [userId, depositAmount, openingBalance, closingBalance, depositId],
    );

    return res.json({
      status: true,
      message: "Test deposit successful ✅",
      depositId,
      openingBalance,
      closingBalance,
    });
  } catch (err) {
    console.error("testDeposit error", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// ----------------------------------------- (will use in production) Will add more wallet related APIs like withdraw, transaction history etc. --------------------------------
//  =====================================   Initiate Deposit   =======================================

exports.initiateDeposit = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthenticated" });
    }

    const { amount, gateway } = req.body;

    if (!isPositiveAmount(amount)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid deposit amount" });
    }

    if (gateway && !isStringMax(gateway, 255)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid gateway value" });
    }

    const depositAmount = parseFloat(amount);
    const gatewayName = gateway || "MANUAL";

    const gatewayTxnId = `DEP-${Date.now()}-${Math.floor(Math.random() * 900000)}`;

    const sql = `
      INSERT INTO deposits (userId, amount, gateway, gatewayTxnId, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `;

    const [result] = await global.db.query(sql, [
      userId,
      depositAmount.toFixed(2),
      gatewayName,
      gatewayTxnId,
    ]);

    return res.status(201).json({
      status: true,
      depositId: result.insertId,
      gatewayTxnId,
      message: "Deposit initiated. Wait for callback.",
    });
  } catch (err) {
    console.error("initiateDeposit error", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

//========================================= Deposit Callback =======================================

exports.depositCallback = async (req, res) => {
  try {
    const { gatewayTxnId, status, amount, userId, gateway } = req.body;

    if (!gatewayTxnId || typeof gatewayTxnId !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Invalid gatewayTxnId" });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({ status: false, message: "Invalid status" });
    }

    if (!isPositiveAmount(amount)) {
      return res.status(400).json({ status: false, message: "Invalid amount" });
    }

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ status: false, message: "Invalid userId" });
    }

    const depositAmount = parseFloat(amount);

    const [rows] = await global.db.query(
      `SELECT * FROM deposits WHERE gatewayTxnId = ?`,
      [gatewayTxnId],
    );

    let depositId;

    if (!rows.length) {
      const [ins] = await global.db.query(
        `INSERT INTO deposits (userId, amount, gateway, gatewayTxnId, status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          depositAmount.toFixed(2),
          gateway || "UNKNOWN",
          gatewayTxnId,
          status,
        ],
      );
      depositId = ins.insertId;
    } else {
      const dep = rows[0];
      depositId = dep.depositId;

      if (dep.status === status) {
        return res.json({
          status: true,
          message: "Already processed",
          depositId,
        });
      }

      await global.db.query(
        `UPDATE deposits SET status=?, amount=?, updatedAt=CURRENT_TIMESTAMP WHERE depositId=?`,
        [status, depositAmount.toFixed(2), depositId],
      );
    }

    if (status === "SUCCESS") {
      await global.db.query(
        `INSERT INTO user_wallets (userId, depositBalance, bonusBalance, winningBalance)
         SELECT ?,0,0,0 FROM DUAL
         WHERE NOT EXISTS (SELECT 1 FROM user_wallets WHERE userId = ?)`,
        [userId, userId],
      );

      const [before] = await global.db.query(
        `SELECT depositBalance, bonusBalance, winningBalance,
         (depositBalance + bonusBalance + winningBalance) AS total
         FROM user_wallets WHERE userId = ?`,
        [userId],
      );

      const openingBalance = before.length ? parseFloat(before[0].total) : 0;

      await global.db.query(
        `UPDATE user_wallets
         SET depositBalance = depositBalance + ?,
             totalBalance = depositBalance + ? + bonusBalance + winningBalance,
             updatedAt = CURRENT_TIMESTAMP
         WHERE userId = ?`,
        [depositAmount.toFixed(2), depositAmount.toFixed(2), userId],
      );

      const [after] = await global.db.query(
        `SELECT (depositBalance + bonusBalance + winningBalance) AS total
         FROM user_wallets WHERE userId = ?`,
        [userId],
      );

      const closingBalance = after.length
        ? parseFloat(after[0].total)
        : openingBalance + depositAmount;

      await global.db.query(
        `INSERT INTO wallet_transactions
         (userId, transactionType, amount, openingBalance, closingBalance,
          referenceId, referenceType, status, note)
         VALUES (?, 'DEPOSIT', ?, ?, ?, ?, 'DEPOSIT', 'SUCCESS', ?)`,
        [
          userId,
          depositAmount.toFixed(2),
          openingBalance.toFixed(2),
          closingBalance.toFixed(2),
          depositId,
          `Gateway ${gateway || "UNKNOWN"}`,
        ],
      );
    }

    return res.json({ status: true, depositId, message: "Callback processed" });
  } catch (err) {
    console.error("depositCallback error", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

//----------------------------------------- above code will use in production -----------------------------------------------------

//=======================================  Request Withdraw  =======================================

exports.requestWithdraw = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthenticated" });
    }

    const { amount, upiId, bankName, accountNumber, ifsc } = req.body;

    if (!isPositiveAmount(amount)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid withdraw amount" });
    }

    const withdrawAmount = parseFloat(amount);

    const [walletRows] = await global.db.query(
      `SELECT depositBalance, winningBalance, bonusBalance,
       (depositBalance + winningBalance + bonusBalance) AS total
       FROM user_wallets WHERE userId = ?`,
      [userId],
    );

    if (!walletRows.length) {
      return res
        .status(400)
        .json({ status: false, message: "Wallet not found" });
    }

    const wallet = walletRows[0];
    const withdrawable =
      parseFloat(wallet.depositBalance) + parseFloat(wallet.winningBalance);

    if (withdrawAmount > withdrawable) {
      return res
        .status(400)
        .json({ status: false, message: "Insufficient balance" });
    }

    const updateSql = `
      UPDATE user_wallets
      SET
        depositBalance = depositBalance - LEAST(depositBalance, ?),
        winningBalance = winningBalance - GREATEST(0, ? - depositBalance),
        totalBalance =
          (depositBalance - LEAST(depositBalance, ?)) +
          (winningBalance - GREATEST(0, ? - depositBalance)) +
          bonusBalance,
        updatedAt = CURRENT_TIMESTAMP
      WHERE userId = ? AND (depositBalance + winningBalance) >= ?`;

    const [updateResult] = await global.db.query(updateSql, [
      withdrawAmount,
      withdrawAmount,
      withdrawAmount,
      withdrawAmount,
      userId,
      withdrawAmount,
    ]);

    if (!updateResult.affectedRows) {
      return res.status(400).json({
        status: false,
        message: "Balance changed, try again",
      });
    }

    const [after] = await global.db.query(
      `SELECT (depositBalance + winningBalance + bonusBalance) AS total
       FROM user_wallets WHERE userId = ?`,
      [userId],
    );

    const closingBalance = parseFloat(after[0].total);
    const openingBalance = closingBalance + withdrawAmount;

    const [ins] = await global.db.query(
      `INSERT INTO withdraw_requests
       (userId, amount, upiId, bankName, accountNumber, ifsc, status,
        createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING',
               CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        userId,
        withdrawAmount.toFixed(2),
        upiId || null,
        bankName || null,
        accountNumber || null,
        ifsc || null,
      ],
    );

    const withdrawId = ins.insertId;

    await global.db.query(
      `INSERT INTO wallet_transactions
       (userId, transactionType, amount, openingBalance, closingBalance,
        referenceId, referenceType, status, note, createdAt)
       VALUES (?, 'WITHDRAW', ?, ?, ?, ?, 'WITHDRAW_REQUEST',
               'PENDING', ?, CURRENT_TIMESTAMP)`,
      [
        userId,
        withdrawAmount.toFixed(2),
        openingBalance.toFixed(2),
        closingBalance.toFixed(2),
        withdrawId,
        "User withdraw request",
      ],
    );

    return res.json({
      status: true,
      withdrawId,
      message: "Withdraw requested",
    });
  } catch (err) {
    console.error("requestWithdraw error", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

//===============================  Transaction History  =======================================

exports.getTransactions = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "Unauthenticated",
      });
    }

    // pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const offset = (page - 1) * limit;

    const { fromDate, toDate, transactionType } = req.query;

    const filters = [];
    const params = [userId];

    // ✅ transactionType filter
    if (transactionType) {
      filters.push(`transactionType = ?`);
      params.push(transactionType);
    }

    // ✅ date filters (validate format)
    if (fromDate && !isNaN(Date.parse(fromDate))) {
      filters.push(`createdAt >= ?`);
      params.push(fromDate);
    }

    if (toDate && !isNaN(Date.parse(toDate))) {
      filters.push(`createdAt <= ?`);
      params.push(toDate);
    }

    const whereClause = filters.length ? `AND ${filters.join(" AND ")}` : "";

    // ✅ get total count (for pagination UI)
    const [countRows] = await global.db.query(
      `SELECT COUNT(*) as total
       FROM wallet_transactions
       WHERE userId = ?
       ${whereClause}`,
      params,
    );

    const total = countRows[0].total;

    // ✅ main query
    const [rows] = await global.db.query(
      `SELECT transactionId,
              transactionType,
              amount,
              openingBalance,
              closingBalance,
              referenceType,
              referenceId,
              status,
              note,
              createdAt
       FROM wallet_transactions
       WHERE userId = ?
       ${whereClause}
       ORDER BY transactionId DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return res.json({
      status: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: rows,
    });
  } catch (err) {
    console.error("getTransactions error", err);
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
