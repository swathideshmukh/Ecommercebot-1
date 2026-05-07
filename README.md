# 🛍️ WhatsApp E-commerce Bot

A full-featured **WhatsApp shopping chatbot** built using **Node.js, Express, MongoDB, and WhatsApp Cloud API**, enabling users to browse products, add to cart, and place orders directly from WhatsApp.

---

## 🚀 Features

### 🛒 Shopping

* Browse categories & products
* View product images and details
* Add to cart using interactive buttons
* Clothing flow with:

  * Size selection
  * Color selection
  * Quantity selection

### 💬 Chatbot

* Interactive WhatsApp UI (buttons & lists)
* Smart message routing
* Pagination ("View More")
* Human agent handoff support

### 💳 Checkout

* Cart management
* Order creation
* Razorpay payment integration (webhook ready)

---

## 🧠 Tech Stack

* **Backend:** Node.js + Express
* **Database:** MongoDB (Mongoose)
* **Messaging:** WhatsApp Cloud API
* **Architecture:** MVC + Service Layer

---

## 📁 Project Structure

```id="structure"
ECOMMERCEBOT/
│
├── config/
│   └── mongodb.js
│
├── controllers/
│   └── chatController.js
│
├── models/
│   ├── Cart.js
│   ├── Category.js
│   ├── Order.js
│   ├── Product.js
│   └── User.js
│
├── repositories/
│   ├── cartRepository.js
│   ├── orderRepository.js
│   └── productRepository.js
│
├── routes/
│   ├── webhook.js
│   └── razorpayWebhook.js
│
├── services/
│   ├── cartService.js
│   ├── orderService.js
│   ├── razorpayService.js
│   └── whatsappService.js
│
├── utils/
│   └── formatters.js
│
├── seed.js
├── server.js
├── package.json
├── .env
└── TODO.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash id="clone"
git clone https://github.com/your-username/whatsapp-ecommerce-bot.git
cd whatsapp-ecommerce-bot
```

---

### 2️⃣ Install Dependencies

```bash id="install"
npm install
```

---

### 3️⃣ Setup Environment Variables

Create `.env` file:

```env id="env"
PORT=5000

MONGO_URI=your_mongodb_atlas_url

ACCESS_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id
VERIFY_TOKEN=your_verify_token

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

### 4️⃣ Seed Database

```bash id="seed"
node seed.js
```

---

### 5️⃣ Start Server

```bash id="run"
node server.js
```

---

## 🔗 Webhook Setup (WhatsApp)

1. Go to Meta Developer Dashboard
2. Configure webhook:

```id="webhook"
https://your-domain.com/webhook
```

3. Verify using `VERIFY_TOKEN`
4. Subscribe ONLY to:

```id="subs"
messages
```

---

## 📱 User Flow

```id="flow"
Hi → Menu
   → Browse Categories
   → Select Product
   → Add to Cart
   → Checkout
   → Payment Link
```

---

## 👩‍💼 Human Agent Support

* User clicks **"Talk to Agent"**
* Bot pauses responses
* Agent handles conversation
* User types `back` to return to bot

---

## ⚠️ Limitations

* WhatsApp does NOT support:

  * ❌ Product grid UI
  * ❌ Horizontal scroll (carousel without approval)

* Implemented workaround:

  * ✅ Image + buttons catalog style

---

## 🔮 Future Enhancements

* WhatsApp Catalog API integration
* Admin dashboard (live chat)
* AI recommendations
* Order tracking system
* Inventory management

---

## 🧪 Testing

Send messages:

```id="test"
Hi
Menu
Browse
```

---

## 📌 Notes

* Use HTTPS for production webhook
* Keep tokens secure
* Ensure MongoDB Atlas IP whitelist

---

## 👨‍💻 Author

**Swathi Deshmukh**
 Full Stack Developer

---

## ⭐ Contribution

Feel free to fork and improve this project!

---

## 📄 License

MIT License
