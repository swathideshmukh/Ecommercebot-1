# Checkout Address Collection Plan

**Information Gathered:**
- Current checkout flow: checkout() → orderService.checkout(phone) → payment link
- Order model lacks `address` field
- No address state in userSelections
- Need address before creating order/payment

**Plan:**
1. **models/Order.js**: Add `address` field (string, required)
2. **controllers/chatController.js**:
   - checkout(): Check for cart, ask for address 
   - routeMessage(): Handle `ADDRESS_` button (collect address, create order)
   - Add address to userSelections state
3. **services/orderService.js**: Pass address to orderRepository
4. **repositories/orderRepository.js**: Add address to createOrderFromCart
5. **Update TODO.md**: Mark complete

**Dependent Files:**
- models/Order.js
- controllers/chatController.js  
- services/orderService.js
- repositories/orderRepository.js

**Follow-up Steps:**
- Run `node --check **/*.js` for syntax
- Test checkout flow with WhatsApp simulator

- [ ] 1. Add `address` field to models/Order.js
- [ ] 2. Update controllers/chatController.js checkout() flow
- [ ] 3. Add ADDRESS_ handler in routeMessage()
- [ ] 4. Update services/orderService.js checkout()
- [ ] 5. Update repositories/orderRepository.js createOrderFromCart()


