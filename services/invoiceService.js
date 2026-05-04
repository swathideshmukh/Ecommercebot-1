const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateInvoice(order) {
  return new Promise((resolve, reject) => {
    const invoiceDir = path.join(__dirname, "..", "invoices");

    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    const orderCode = order.orderCode || order.order_code || `ORD-${Date.now()}`;
    const fileName = `${orderCode}.pdf`;
    const filePath = path.join(invoiceDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(22).text("ShopBot Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${orderCode}`);
    doc.text(`Status: ${order.status || "PAID"}`);
    doc.text(`Date: ${new Date().toLocaleString("en-IN")}`);
    doc.moveDown();

    doc.fontSize(14).text("Delivery Address:");
    doc.fontSize(12).text(order.address || "Address not provided");
    doc.moveDown();

    doc.fontSize(15).text("Items:");
    doc.moveDown();

    const items = order.items || [];

    if (!items.length) {
      doc.fontSize(12).text("No items found.");
    } else {
      items.forEach((item, index) => {
        doc.fontSize(12).text(
          `${index + 1}. ${item.name || item.productName} | Qty: ${item.quantity} | Price: ₹${item.price}`
        );
      });
    }

    doc.moveDown();
    doc.fontSize(12).text(`Subtotal: ₹${Number(order.subtotal || order.total || 0).toLocaleString("en-IN")}`);
    doc.text(`Discount: ₹${Number(order.discount || 0).toLocaleString("en-IN")}`);
    doc.fontSize(14).text(`Grand Total: ₹${Number(order.total || 0).toLocaleString("en-IN")}`);

    doc.moveDown();
    doc.text("Thank you for shopping with ShopBot!");

    doc.end();

    stream.on("finish", () => resolve(fileName));
    stream.on("error", reject);
  });
}

module.exports = {
  generateInvoice
};