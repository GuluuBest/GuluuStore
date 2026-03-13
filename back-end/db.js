const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, "database.sqlite"));
    this.init();
  }

  init() {
    // Create orders table
    this.db.run(
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_code TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        email TEXT,
        notes TEXT,
        product_data TEXT NOT NULL,
        total_price INTEGER NOT NULL,
        payment_proof TEXT NOT NULL,
        status TEXT DEFAULT 'pending_payment',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Error creating orders table:", err);
        } else {
          console.log("✅ Orders table ready");
        }
      },
    );

    // Create admins table
    this.db.run(
      `CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Error creating admins table:", err);
        } else {
          console.log("✅ Admins table ready");
        }
      },
    );

    // Create admin_logs table
    this.db.run(
      `CREATE TABLE IF NOT EXISTS admin_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        admin_username TEXT,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Error creating admin_logs table:", err);
        } else {
          console.log("✅ Admin logs table ready");
        }
      },
    );

    this.insertDefaultAdmin();
  }

  insertDefaultAdmin() {
    const defaultAdmin = {
      username: "admin",
      password: "admin123",
      name: "Administrator",
      role: "superadmin",
    };

    this.db.get(
      "SELECT id FROM admins WHERE username = ?",
      [defaultAdmin.username],
      (err, row) => {
        if (err) {
          console.error("Error checking default admin:", err);
          return;
        }

        if (!row) {
          this.db.run(
            "INSERT INTO admins (username, password, name, role) VALUES (?, ?, ?, ?)",
            [
              defaultAdmin.username,
              defaultAdmin.password,
              defaultAdmin.name,
              defaultAdmin.role,
            ],
            (err) => {
              if (err) {
                console.error("Error inserting default admin:", err);
              } else {
                console.log("✅ Default admin created: admin/admin123");
              }
            },
          );
        } else {
          console.log("✅ Default admin already exists");
        }
      },
    );
  }

  // ✅ CREATE ORDER
  createOrder(orderData, callback) {
    const sql = `
      INSERT INTO orders (
        order_code, customer_name, whatsapp, email, notes,
        product_data, total_price, payment_proof, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      orderData.order_code,
      orderData.customer_name,
      orderData.whatsapp,
      orderData.email || null,
      orderData.notes || null,
      JSON.stringify(orderData.product_data),
      orderData.total_price,
      orderData.payment_proof,
      orderData.status || "pending_payment",
    ];

    this.db.run(sql, params, function (err) {
      callback(err, this.lastID);
    });
  }

  // ✅ GET ALL ORDERS
  getAllOrders(callback) {
    const sql = `SELECT * FROM orders ORDER BY created_at DESC`;

    this.db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("❌ Error in getAllOrders:", err.message);
        callback(err, null);
      } else {
        console.log(`✅ Retrieved ${rows.length} orders from database`);
        callback(null, rows);
      }
    });
  }

  // ✅ GET ORDER BY ID
  getOrderById(id, callback) {
    const sql = "SELECT * FROM orders WHERE id = ?";

    this.db.get(sql, [id], (err, row) => {
      if (err) {
        console.error(`❌ Error in getOrderById ${id}:`, err.message);
        callback(err, null);
      } else {
        if (row) {
          console.log(`✅ Order ${id} found in database`);
        } else {
          console.log(`⚠️ Order ${id} not found in database`);
        }
        callback(null, row);
      }
    });
  }

  // ✅ UPDATE ORDER STATUS
  updateOrderStatus(id, status, callback) {
    const sql = "UPDATE orders SET status = ? WHERE id = ?";

    this.db.run(sql, [status, id], function (err) {
      if (err) {
        console.error(`❌ Error updating order ${id}:`, err.message);
        callback(err);
      } else {
        console.log(
          `✅ Order ${id} status updated to ${status} (${this.changes} rows affected)`,
        );
        callback(null);
      }
    });
  }

  // ✅ DELETE ORDER
  deleteOrder(id, callback) {
    const sql = "DELETE FROM orders WHERE id = ?";

    this.db.run(sql, [id], function (err) {
      if (err) {
        console.error(`❌ Error deleting order ${id}:`, err.message);
        callback(err, null);
      } else {
        console.log(`✅ Order ${id} deleted (${this.changes} rows affected)`);
        callback(null, this.changes);
      }
    });
  }

  // ✅ LOGIN ADMIN
  loginAdmin(username, password, callback) {
    const sql = "SELECT * FROM admins WHERE username = ? AND password = ?";

    this.db.get(sql, [username, password], (err, row) => {
      if (err) {
        console.error(`❌ Error in loginAdmin for ${username}:`, err.message);
        callback(err, null);
      } else {
        if (row) {
          console.log(`✅ Admin ${username} found`);
        } else {
          console.log(`⚠️ Admin ${username} not found or invalid password`);
        }
        callback(null, row);
      }
    });
  }

  // ✅ LOG ADMIN ACTIVITY
  logAdminActivity(adminId, adminUsername, action, details, ip, userAgent) {
    const sql = `
      INSERT INTO admin_logs (admin_id, admin_username, action, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const detailsStr = details ? JSON.stringify(details) : null;

    this.db.run(
      sql,
      [adminId, adminUsername, action, detailsStr, ip, userAgent],
      (err) => {
        if (err) {
          console.error("❌ Error logging admin activity:", err.message);
        } else {
          console.log(`✅ Logged admin activity: ${adminUsername} - ${action}`);
        }
      },
    );
  }

  // ✅ GET ADMIN LOGS
  getAdminLogs(callback) {
    const sql = `SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100`;

    this.db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("❌ Error in getAdminLogs:", err.message);
        callback(err, null);
      } else {
        console.log(`✅ Retrieved ${rows.length} admin logs`);
        callback(null, rows);
      }
    });
  }

  // ✅ GET ADMIN STATS
  getAdminStats(callback) {
    const stats = {};

    // Get total orders
    this.db.get("SELECT COUNT(*) as total FROM orders", (err, row) => {
      if (!err && row) stats.totalOrders = row.total;

      // Get total logs
      this.db.get("SELECT COUNT(*) as total FROM admin_logs", (err, row) => {
        if (!err && row) stats.totalLogs = row.total;

        // Get order status distribution
        this.db.all(
          `SELECT status, COUNT(*) as count FROM orders GROUP BY status`,
          (err, rows) => {
            if (!err) stats.orderStatus = rows;

            // Get top admins by activity
            this.db.all(
              `SELECT admin_username, COUNT(*) as activity_count 
               FROM admin_logs 
               GROUP BY admin_username 
               ORDER BY activity_count DESC 
               LIMIT 10`,
              (err, rows) => {
                if (!err) stats.topAdmins = rows;

                console.log("✅ Admin stats retrieved");
                callback(null, stats);
              },
            );
          },
        );
      });
    });
  }
}

// ✅ EKSPORT INSTANCE DATABASE YANG BENAR
module.exports = new Database();
