function money(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatProduct(product) {
  return `📱 *${product.name}*

💰 Price: ₹${product.price}

📝 ${product.description || "High quality product"}

🆔 ID: ${product.id}`;
}

function formatCart(cart) {
  if (!cart.items.length) {
    return "🛒 Your cart is empty.";
  }

  const items = cart.items.map((item, index) => {
    return `${index + 1}. ${item.name}
ID: ${item.id}
Qty: ${item.quantity}
Subtotal: ${money(item.subtotal)}

Remove:
remove ${item.id}`;
  });

  return `🛒 *Your Cart*

${items.join("\n\n")}

Total: *${money(cart.total)}*`;
}

function formatOrder(order) {
  const items = order.items.map((item, index) => {
    return `${index + 1}. ${item.name} x ${item.quantity} — ${money(
      Number(item.price) * Number(item.quantity)
    )}`;
  });

  return `✅ *Order Placed Successfully*

Order ID: ${order.orderCode}

${items.join("\n")}

Total: *${money(order.total)}*

Fake Payment Link:
${order.paymentLink}

Thank you for shopping with us.`;
}

module.exports = {
  money,
  formatProduct,
  formatCart,
  formatOrder
};