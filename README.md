# 🛍️ WhatsApp E-commerce Chatbot

A full-stack WhatsApp chatbot built using **Node.js, Express, MongoDB, and WhatsApp Cloud API** that allows users to browse products, add items to cart, and place orders directly via WhatsApp.

---

## 🚀 Features

### 🛒 Shopping Experience

* Browse products by category
* View product details with images
* Add to cart with interactive buttons
* Clothing flow with size, color, and quantity selection
* Pagination (View More products)

### 💬 Chatbot Features

* Interactive menus (buttons + lists)
* Smart routing of user messages
* Human agent handoff support
* Cart management (add/remove/view)

### 💳 Checkout

* Order placement
* Payment link generation (Razorpay integration ready)

---

## 🧠 Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Atlas)
* **API:** WhatsApp Cloud API
* **Architecture:** MVC (Controller, Repository, Services)

---

## 📁 Project Structure

```id="projstruct"
Ecommercebot/
│
├── controllers/
│   └── chatController.js
│
├── repositories/
│   └── productRepository.js
│
├── services/
│   ├── whatsappService.js
│   ├── cartService.js
│   └── orderService.js
│
├── models/
│   ├── Product.js
│   ├── Category.js
│   └── Cart.js
│
├── config/
│   └── mongodb.js
│
├── routes/
│   └── webhook.js
│
├── seed.js
├── server.js
└── .env
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash id="clone"
git clone https://github.com/your-username/whatsapp-ecommerce.git
cd whatsapp-ecommerce
```

---

### 2️⃣ Install Dependencies

```bash id="install"
npm install
```

---

### 3️⃣ Configure Environment Variables

Create `.env` file:

```env id="env"
PORT=5000

MONGO_URI=your_mongodb_atlas_url

ACCESS_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id

VERIFY_TOKEN=your_verify_token
```

---

### 4️⃣ Seed Database

```bash id="seed"
node seed.js
```

---

### 5️⃣ Run Server

```bash id="run"
node server.js
```

---

## 🔗 Webhook Setup

1. Go to Meta Developer Dashboard
2. Add webhook URL:

```
https://your-domain.com/webhook
```

3. Verify using `VERIFY_TOKEN`
4. Subscribe only to:

```
messages
```

---

## 📱 WhatsApp Bot Flow

```id="flow"
User → Menu
     → Browse Categories
     → Select Product
     → Add to Cart
     → Checkout
     → Payment Link
```

---

## 👩‍💼 Human Agent Support

Users can switch to human support:

* Click **"Talk to Agent"**
* Bot pauses responses
* Agent replies manually or via dashboard
* User types `back` to return to bot

---

## ⚠️ Limitations

* WhatsApp Cloud API does NOT support:

  * ❌ Horizontal scrolling UI
  * ❌ True product grids

* Catalog-like experience is simulated using:

  * Images + Buttons

---

## 🔮 Future Enhancements

* WhatsApp Commerce Catalog API integration
* Admin dashboard for live chat
* AI product recommendations
* Order tracking system
* Payment webhook verification

---

## 🧪 Testing

Use WhatsApp sandbox or your registered number:

```id="test"
Hi → Menu → Browse → Add → Checkout
```

---

## 📌 Important Notes

* Ensure MongoDB Atlas IP is whitelisted
* Use HTTPS for webhook in production
* Keep access tokens secure

---

## 👨‍💻 Author

Swathi Deshmukh
ISE 5th Semester
Full Stack + AI Enthusiast

---

## ⭐ Contribute

Feel free to fork this repo and improve features!

---

## 📄 License

MIT License
