const db = require('../services/db');

// This is a compatibility layer for existing models that use callbacks
module.exports = {
  query: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // In mysql2/promise, execute/query expects ? markers for params.
    // If the model uses 'SET ?', it might need special handling.
    // But for simple queries it works fine.
    
    db.query(sql, params)
      .then(res => {
        // Special case for INSERT to return insertId correctly if it's an object
        if (res && res.insertId) {
            // mysql2/promise already returns insertId in the rows object for INSERT
        }
        callback(null, res);
      })
      .catch(err => {
        console.error("Database error:", err);
        callback(err, null);
      });
  }
};
