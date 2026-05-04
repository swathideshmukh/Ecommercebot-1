const API_VERSION = "v18.0";
const fetch = require("node-fetch");

async function sendWhatsAppMessage(to, body) {
  return sendRequest({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      preview_url: false,
      body
    }
  });
}

async function sendButtonMessage(to, body, buttons) {
  return sendRequest({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.slice(0, 3).map((button) => ({
          type: "reply",
          reply: {
            id: button.id,
            title: button.title
          }
        }))
      }
    }
  });
}

async function sendImageMessage(to, imageUrl, caption) {
  return sendRequest({
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: {
      link: imageUrl,
      caption
    }
  });
}

async function sendMultiProductMessage(to, catalogId, products, categoryName) {
  return sendRequest({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "product_list",
      header: {
        type: "text",
        text: `${categoryName} Collection`
      },
      body: {
        text: "Browse products below and add your favorites to cart 🛒"
      },
      footer: {
        text: "ShopBot"
      },
      action: {
        catalog_id: catalogId,
        sections: [
          {
            title: categoryName.slice(0, 24),
            product_items: products.slice(0, 10).map((product) => ({
              product_retailer_id: product.retailer_id
            }))
          }
        ]
      }
    }
  });
}

async function sendRequest(payload) {
  const url = `https://graph.facebook.com/${API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
  console.error("WhatsApp API error:", JSON.stringify(data, null, 2));
  console.error("Payload was:", JSON.stringify(payload, null, 2));
  throw new Error("Failed to send WhatsApp message");
}

  return data;
}
async function sendListMessage(to, body, buttonText, rows) {
  return sendRequest({
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: {
        text: body
      },
      action: {
        button: buttonText,
        sections: [
          {
            title: "Categories",
            rows: rows.slice(0, 10).map((row) => ({
              id: row.id,
              title: row.title,
              description: row.description || ""
            }))
          }
        ]
      }
    }
  });
}

async function sendDocumentMessage(to, documentUrl, filename, caption) {
  console.log("SENDING DOCUMENT:", documentUrl);

  return sendRequest({
    messaging_product: "whatsapp",
    to,
    type: "document",
    document: {
      link: documentUrl,
      filename,
      caption
    }
  });
}

module.exports = {
  sendWhatsAppMessage,
  sendButtonMessage,
  sendImageMessage,
  sendListMessage,
  sendMultiProductMessage,
  sendDocumentMessage
};