const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Hanya file gambar (JPEG/PNG) yang diizinkan"));
    }
  },
});

router.post("/", upload.single("payment_proof"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Bukti pembayaran wajib diupload",
    });
  }

  const required = [
    "order_code",
    "customer_name",
    "whatsapp",
    "product_data",
    "total_price",
  ];

  for (const field of required) {
    if (!req.body[field]) {
      return res.status(400).json({
        success: false,
        error: `Field ${field} wajib diisi`,
      });
    }
  }

  let productData;
  try {
    productData = JSON.parse(req.body.product_data);
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: "Format product_data tidak valid",
    });
  }

  const orderData = {
    order_code: req.body.order_code,
    customer_name: req.body.customer_name,
    whatsapp: req.body.whatsapp,
    email: req.body.email || null,
    notes: req.body.notes || null,
    product_data: productData,
    total_price: parseInt(req.body.total_price),
    payment_proof: `/uploads/${req.file.filename}`,
    status: "pending_payment",
  };

  db.createOrder(orderData, (err, orderId) => {
    if (err) {
      console.error(
        `❌ ORDER FAILED: ${orderData.order_code} - ${err.message}`,
      );
      return res.status(500).json({
        success: false,
        error: "Gagal menyimpan order",
      });
    }

    console.log(
      `✅ ORDER CREATED: ${orderData.order_code} | ${orderData.customer_name} | Rp ${orderData.total_price}`,
    );

    res.status(201).json({
      success: true,
      message: "Order berhasil dibuat",
      order_id: orderId,
      order_code: orderData.order_code,
      payment_proof_url: orderData.payment_proof,
    });
  });
});

// GET /api/orders - Get all orders
router.get("/", (req, res) => {
  console.log("📋 GET /api/orders - Fetching all orders...");

  db.getAllOrders((err, orders) => {
    if (err) {
      console.error("❌ Error fetching orders:", err);
      return res.status(500).json({
        success: false,
        error: "Gagal mengambil data order",
      });
    }

    // PARSE product_data dari JSON string ke object
    const formattedOrders = orders.map((order) => {
      try {
        return {
          ...order,
          product_data: JSON.parse(order.product_data),
        };
      } catch (e) {
        console.error(
          `❌ Error parsing product_data for order ${order.id}:`,
          e,
        );
        return {
          ...order,
          product_data: [],
        };
      }
    });

    console.log(`✅ Retrieved ${formattedOrders.length} orders`);

    res.json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  });
});

// PATCH /api/orders/:id - Update status
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`🔄 PATCH /api/orders/${id} - Updating to status: ${status}`);

  if (!status) {
    return res.status(400).json({
      success: false,
      error: "Status wajib diisi",
    });
  }

  const allowedStatus = [
    "pending_payment",
    "verified",
    "completed",
    "cancelled",
  ];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Status tidak valid",
    });
  }

  db.updateOrderStatus(id, status, (err) => {
    if (err) {
      console.error(`❌ Error updating order ${id}:`, err);
      return res.status(500).json({
        success: false,
        error: "Gagal mengupdate status order",
      });
    }

    console.log(`✅ Order ${id} updated to ${status}`);

    res.json({
      success: true,
      message: `Status order berhasil diupdate ke: ${status}`,
    });
  });
});

// DELETE /api/orders/:id - Delete order
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  console.log(`🗑️ DELETE /api/orders/${id} - Request received`);

  db.getOrderById(id, (err, order) => {
    if (err) {
      console.error(`❌ Error checking order ${id}:`, err.message);
      return res.status(500).json({
        success: false,
        error: "Gagal memeriksa order",
      });
    }

    if (!order) {
      console.log(`⚠️ Order ${id} not found`);
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Hapus file bukti pembayaran
    if (order.payment_proof) {
      try {
        let proofPath = order.payment_proof;
        if (proofPath.startsWith("/")) {
          proofPath = proofPath.substring(1);
        }

        const fullPath = path.join(__dirname, "..", proofPath);

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`✅ Deleted payment proof: ${fullPath}`);
        }
      } catch (fileErr) {
        console.error(`⚠️ Error deleting file:`, fileErr.message);
      }
    }

    // Hapus dari database
    db.deleteOrder(id, (deleteErr, changes) => {
      if (deleteErr) {
        console.error(`❌ Database error:`, deleteErr.message);
        return res.status(500).json({
          success: false,
          error: "Gagal menghapus dari database",
        });
      }

      console.log(`✅ Order ${id} deleted (${changes} rows affected)`);

      res.json({
        success: true,
        message: "Order berhasil dihapus",
        data: {
          id: id,
          order_code: order.order_code,
          customer_name: order.customer_name,
        },
      });
    });
  });
});

// GET /api/orders/:id - Get single order
router.get("/:id", (req, res) => {
  const { id } = req.params;

  console.log(`🔍 GET /api/orders/${id} - Fetching order...`);

  db.getOrderById(id, (err, order) => {
    if (err) {
      console.error(`❌ Error fetching order ${id}:`, err);
      return res.status(500).json({
        success: false,
        error: "Gagal mengambil data order",
      });
    }

    if (!order) {
      console.log(`⚠️ Order ${id} not found`);
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan",
      });
    }

    // Parse product_data
    let productData;
    try {
      productData = JSON.parse(order.product_data);
    } catch (e) {
      console.error(`❌ Error parsing product_data for order ${id}:`, e);
      productData = [];
    }

    const formattedOrder = {
      ...order,
      product_data: productData,
    };

    console.log(`✅ Order ${id} retrieved`);

    res.json({
      success: true,
      order: formattedOrder,
    });
  });
});

module.exports = router;
