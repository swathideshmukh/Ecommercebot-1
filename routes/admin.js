const express = require("express");
const Order = require("../db/models/Order");
const OrderItem = require("../db/models/OrderItem");

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    // 📊 Stats
    const totalOrders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    const paidOrders = await Order.countDocuments({ status: "PAID" });

    // 📦 Recent Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 🔥 Top Products
    const topProducts = await OrderItem.aggregate([
      {
        $group: {
          _id: "$productName",
          soldQty: { $sum: "$quantity" }
        }
      },
      { $sort: { soldQty: -1 } },
      { $limit: 10 }
    ]);

    // 🖥 HTML UI (same style as yours)
    res.send(`
      <html>
        <head>
          <title>ShopBot Admin</title>
          <style>
            body { font-family: Arial; background:#f4f6f8; padding:30px; }
            .cards { display:flex; gap:20px; margin-bottom:30px; }
            .card { background:white; padding:20px; border-radius:12px; box-shadow:0 2px 8px #ddd; flex:1; }
            table { width:100%; background:white; border-collapse:collapse; margin-top:20px; }
            th, td { padding:12px; border-bottom:1px solid #eee; text-align:left; }
            h1 { color:#222; }
            select { padding:5px; }
          </style>
        </head>
        <body>
          <h1>📊 ShopBot Admin Dashboard</h1>

          <div class="cards">
            <div class="card"><h3>Total Orders</h3><h2>${totalOrders}</h2></div>
            <div class="card"><h3>Total Revenue</h3><h2>₹${Number(totalRevenue).toLocaleString("en-IN")}</h2></div>
            <div class="card"><h3>Paid Orders</h3><h2>${paidOrders}</h2></div>
          </div>

          <h2>Recent Orders</h2>
          <table>
            <tr>
              <th>Order</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Update</th>
            </tr>

            ${recentOrders.map(o => `
              <tr>
                <td>${o.orderCode}</td>
                <td>₹${Number(o.total).toLocaleString("en-IN")}</td>
                <td>${o.status}</td>
                <td>${o.trackingStatus || "-"}</td>
                <td>
                  <form method="POST" action="/admin/update-tracking">
                    <input type="hidden" name="orderCode" value="${o.orderCode}" />
                    <select name="status">
                      <option>ORDER_PLACED</option>
                      <option>PAYMENT_CONFIRMED</option>
                      <option>PACKED</option>
                      <option>SHIPPED</option>
                      <option>OUT_FOR_DELIVERY</option>
                      <option>DELIVERED</option>
                    </select>
                    <button type="submit">Update</button>
                  </form>
                </td>
              </tr>
            `).join("")}
          </table>

          <h2>Top Products</h2>
          <table>
            <tr><th>Product</th><th>Sold Qty</th></tr>
            ${topProducts.map(p => `
              <tr>
                <td>${p._id}</td>
                <td>${p.soldQty}</td>
              </tr>
            `).join("")}
          </table>
        </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

module.exports = router;

router.post("/update-tracking", express.urlencoded({ extended: true }), async (req, res) => {
  const { orderCode, status } = req.body;

  await Order.findOneAndUpdate(
    { orderCode },
    { trackingStatus: status }
  );

  res.redirect("/admin/dashboard");
});