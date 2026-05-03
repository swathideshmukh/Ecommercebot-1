const PDFDocument = require('pdfkit');
const fs = require('fs');
const FormData = require('form-data');
const { PassThrough } = require('stream');

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const API_VERSION = 'v18.0';

async function generateInvoicePDF(order, phone) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    doc.pipe(stream);

    let y = 50;

    // Header: SHOPBOT
    doc.fontSize(32).font('Helvetica-Bold').text('SHOPBOT', 50, y);
    // INVOICE right-aligned
    const invoiceWidth = doc.widthOfString('INVOICE', 24);
    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', doc.page.width - invoiceWidth - 50, y);
    y += 60;

    // Horizontal line
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
    y += 30;

    // Bill To: left column
    doc.fontSize(14).font('Helvetica-Bold').text('Bill To:', 50, y);
    y += 25;
    doc.fontSize(12).font('Helvetica').text(`Phone: ${phone}`, 50, y);
    y += 20;
    doc.fontSize(12).text(`Address: ${order.address}`, 50, y);
    y += 60;

    // Right column: Invoice details
    const rightX = doc.page.width / 2;
    doc.fontSize(14).font('Helvetica-Bold').text(`Invoice #${order.orderCode}`, rightX, 60);
    doc.fontSize(12).text(`Date: ${order.createdAt.toLocaleDateString('en-IN')}`, rightX, 85);
    doc.fontSize(12).font('Helvetica-Bold').text(`Status: ${order.status}`, rightX, 105);

    y += 30;

    // Items table header
    doc.fontSize(12).font('Helvetica-Bold')
      .text('Item Name', 50, y)
      .text('Qty', 280, y)
      .text('Unit Price', 340, y)
      .text('Subtotal', 440, y);
    y += 25;

    // Horizontal line
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
    y += 10;

    // Items rows
    let subtotal = 0;
    order.items.forEach(item => {
      const itemName = doc.page.widthOfString(item.productName, 12);
      if (itemName > 230) {
        doc.fontSize(10).text(item.productName, 50, y, { width: 230, align: 'left' });
      } else {
        doc.fontSize(12).text(item.productName, 50, y);
      }
      doc.text(item.quantity.toString(), 280, y)
         .text(`₹${item.price}`, 340, y)
         .text(`₹${item.price * item.quantity}`, 440, y);
      subtotal += item.price * item.quantity;
      y += 25;
    });

    // Horizontal line
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke();
    y += 30;

    // Totals right-aligned
    const totalY = y;
    doc.text('Subtotal:', 340, totalY);
    doc.text('₹' + subtotal.toLocaleString('en-IN'), 440, totalY);
    totalY += 25;
    doc.text('Tax (0% GST):', 340, totalY);
    doc.text('₹0', 440, totalY);
    totalY += 25;
    doc.fontSize(14).font('Helvetica-Bold')
      .text('Total:', 340, totalY)
      .text('₹' + order.total.toLocaleString('en-IN'), 440, totalY);

    y = totalY + 50;

    // Footer
    doc.fontSize(10).text('Thank you for shopping with ShopBot!', 50, y);
    doc.text('shopbot.com', doc.page.width - 150, y);

    doc.end();

    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function sendInvoiceViaWhatsApp(phone, orderCode, pdfBuffer) {
  const tempPath = `/tmp/invoice-${orderCode}.pdf`;
  
  try {
    // Save temp file
    fs.writeFileSync(tempPath, pdfBuffer);

    // Step 1: Upload media
    const form = new FormData();
    form.append('file', fs.createReadStream(tempPath), {
      filename: `ShopBot_Invoice_${orderCode}.pdf`,
      contentType: 'application/pdf',
      knownLength: pdfBuffer.length
    });
    form.append('type', 'application/pdf');
    form.append('messaging_product', 'whatsapp');

    const uploadRes = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/media`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`
        },
        body: form
      }
    );

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);

    const mediaId = uploadData.id;

    // Step 2: Send document message
    const sendRes = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'document',
          document: {
            id: mediaId,
            filename: `ShopBot_Invoice_${orderCode}.pdf`,
            caption: `🧾 Your invoice for order ${orderCode}`
          }
        })
      }
    );

    const sendData = await sendRes.json();
    if (!sendRes.ok) throw new Error(`Send failed: ${JSON.stringify(sendData)}`);

    console.log(`Invoice sent successfully for ${orderCode}`);
  } finally {
    // Cleanup
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

module.exports = {
  generateInvoicePDF,
  sendInvoiceViaWhatsApp
};

