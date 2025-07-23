# Chandan Sarees - Dynamic E-commerce Website

A beautiful, dynamic website showcasing traditional Indian clothing with a full-featured REST API backend. Built with Node.js, Express, and modern web technologies.

## 🌟 **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Data Store    │
│   (HTML/CSS/JS) │◄──►│   (Express.js)  │◄──►│   (In-Memory)   │
│                 │    │                 │    │                 │
│ • Dynamic UI    │    │ • REST APIs     │    │ • Products      │
│ • API Calls     │    │ • CRUD Ops      │    │ • Categories    │
│ • Responsive    │    │ • Validation    │    │ • Contacts      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Features**

### **Frontend Features:**
- ✅ **Fully Dynamic** - Data loaded via REST APIs
- ✅ **Responsive Design** - Works on all devices
- ✅ **Product Modal** - Detailed product view with images, pricing, attributes
- ✅ **Category Filtering** - Filter products by category dynamically
- ✅ **Search & Sort** - Find products with search and sorting options
- ✅ **Contact Form** - API-powered contact form with validation
- ✅ **Loading States** - Professional loading indicators
- ✅ **Error Handling** - Graceful error handling and user feedback
- ✅ **Smooth Animations** - Modern CSS animations and transitions

### **Backend Features:**
- ✅ **REST API** - Complete RESTful API for all operations
- ✅ **CRUD Operations** - Create, Read, Update, Delete for products & categories
- ✅ **Data Validation** - Server-side validation for all inputs
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **CORS Support** - Cross-origin resource sharing configured
- ✅ **Security Headers** - Helmet.js for security
- ✅ **Request Logging** - Morgan for HTTP request logging
- ✅ **Health Checks** - Built-in health monitoring

## 📊 **API Endpoints**

### **Products API**
```
GET    /api/products              # Get all products (with filtering, sorting, pagination)
GET    /api/products/:id          # Get specific product
GET    /api/products/category/:cat # Get products by category
POST   /api/products              # Create new product (admin)
PUT    /api/products/:id          # Update product (admin)  
DELETE /api/products/:id          # Delete product (admin)
```

### **Categories API**
```
GET    /api/categories            # Get all categories
GET    /api/categories/:id        # Get specific category
GET    /api/categories/slug/:slug # Get category by slug
POST   /api/categories            # Create category (admin)
PUT    /api/categories/:id        # Update category (admin)
DELETE /api/categories/:id        # Delete category (admin)
```

### **Contact API**
```
POST   /api/contact               # Submit contact form
GET    /api/contact               # Get all messages (admin)
GET    /api/contact/:id           # Get specific message (admin)
PUT    /api/contact/:id           # Update message status (admin)
DELETE /api/contact/:id           # Delete message (admin)
POST   /api/contact/newsletter    # Newsletter subscription
GET    /api/contact/info          # Get business contact info
```

### **System API**
```
GET    /api                       # API documentation
GET    /health                    # Health check endpoint
```

## 🛍️ **Sample Products**

The API comes pre-loaded with authentic Indian attire:

| Product | Price | Category | Features |
|---------|-------|----------|----------|
| **Banarasi Silk Saree** | ₹15,999 | Silk Sarees | Zari work, Wedding wear |
| **Designer Lehenga** | ₹25,999 | Lehengas | Bridal, Heavy dupatta |
| **Cotton Chanderi Saree** | ₹3,999 | Cotton Sarees | Daily wear, Office |
| **Anarkali Suit** | ₹8,999 | Salwar Suits | Party wear, Embroidered |
| **Georgette Saree** | ₹7,999 | Georgette Sarees | Evening, Sequin work |
| **Sharara Set** | ₹12,999 | Sharara Sets | Wedding, Traditional |

## 🔧 **API Query Parameters**

### **Products Filtering:**
```
GET /api/products?category=silk-sarees           # Filter by category
GET /api/products?featured=true                  # Only featured products
GET /api/products?inStock=true                   # Only in-stock items
GET /api/products?minPrice=5000&maxPrice=20000   # Price range
GET /api/products?search=silk                    # Search products
GET /api/products?sortBy=price_low               # Sort options
GET /api/products?page=2&limit=10                # Pagination
```

### **Sort Options:**
- `price_low` - Price: Low to High
- `price_high` - Price: High to Low  
- `rating` - Highest Rated
- `newest` - Latest Products
- `name` - Alphabetical

## 📱 **Frontend Architecture**

### **Dynamic Loading:**
```javascript
// API Class for all backend communication
class ChandanAPI {
    static async getProducts(params = {}) { ... }
    static async getCategories() { ... }
    static async submitContact(data) { ... }
}

// Dynamic rendering
function renderProducts(products) { ... }
function renderCategories(categories) { ... }
```

### **State Management:**
- Global state for products, categories, and loading states
- Real-time updates from API
- Optimistic UI updates

### **Error Handling:**
- Loading spinners during API calls
- Error states with retry options
- User-friendly error messages
- Fallback to cached data when possible

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start the Server**
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### **3. Access the Application**
- **Website:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

### **4. Test API Endpoints**
```bash
# Get all products
curl http://localhost:3000/api/products

# Get featured products only
curl http://localhost:3000/api/products?featured=true

# Get categories
curl http://localhost:3000/api/categories

# Submit contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","message":"Hello!"}'
```

## 📂 **Project Structure**

```
chandan-sarees/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Dynamic JavaScript
├── routes/                # API routes
│   ├── products.js        # Products API
│   ├── categories.js      # Categories API
│   └── contact.js         # Contact API
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables
└── README.md              # Documentation
```

## 🎨 **Frontend Technologies**

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid & Flexbox
- **Vanilla JavaScript** - No frameworks, pure JS
- **Fetch API** - Modern HTTP client
- **CSS Variables** - Consistent theming
- **Intersection Observer** - Scroll animations
- **Local Storage** - Client-side caching

## 🛠️ **Backend Technologies**

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin support
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **UUID** - Unique identifiers
- **Body Parser** - Request parsing

## 🎯 **API Response Format**

### **Success Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalProducts": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "Product not found",
  "message": "The requested product does not exist"
}
```

## 🔒 **Security Features**

- ✅ **Input Validation** - Server-side validation for all inputs
- ✅ **Security Headers** - Helmet.js protection
- ✅ **CORS Configuration** - Controlled cross-origin access
- ✅ **Error Sanitization** - No sensitive data in error responses
- ✅ **Rate Limiting** - Configurable request limits
- ✅ **SQL Injection Protection** - Parameterized queries (future DB integration)

## 📊 **Performance Optimizations**

- ✅ **Lazy Loading** - Content loaded as needed
- ✅ **Image Optimization** - Responsive images from Unsplash
- ✅ **Caching Headers** - Browser caching for static assets
- ✅ **Pagination** - Efficient data loading
- ✅ **Compression** - Gzip compression enabled
- ✅ **CSS Animations** - Hardware-accelerated transforms

## 🌐 **Browser Support**

- ✅ **Chrome** (latest)
- ✅ **Firefox** (latest)
- ✅ **Safari** (latest)
- ✅ **Edge** (latest)
- ✅ **Mobile Browsers** - iOS Safari, Chrome Mobile

## 📱 **Responsive Breakpoints**

- **Desktop:** 1200px and above
- **Tablet:** 768px - 1199px  
- **Mobile:** Below 768px
- **Small Mobile:** Below 480px

## 🚀 **Deployment Options**

### **1. Local Development**
```bash
npm run dev
```

### **2. Production Server**
```bash
npm start
```

### **3. Docker (Future)**
```dockerfile
# Dockerfile for containerization
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### **4. Cloud Deployment**
- **Heroku** - Ready for Heroku deployment
- **Vercel** - Serverless deployment
- **AWS EC2** - Traditional server deployment
- **DigitalOcean** - Droplet deployment

## 🔧 **Environment Configuration**

```bash
# .env file
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🎨 **Customization**

### **Colors (CSS Variables):**
```css
:root {
    --primary-color: #8B0000;    /* Deep Red */
    --secondary-color: #FFD700;   /* Gold */
    --accent-color: #FF6B35;      /* Orange */
    --text-dark: #2C2C2C;        /* Dark Gray */
    --text-light: #666;          /* Light Gray */
}
```

### **API Configuration:**
- Modify `routes/` files for custom endpoints
- Update data models in route files
- Add new API routes in `server.js`

## 🚀 **Future Enhancements**

### **Phase 1 - Database Integration**
- [ ] PostgreSQL/MongoDB integration
- [ ] User authentication & authorization
- [ ] Admin dashboard for content management
- [ ] Image upload functionality

### **Phase 2 - E-commerce Features**
- [ ] Shopping cart functionality
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Order management system
- [ ] Inventory tracking

### **Phase 3 - Advanced Features**
- [ ] User reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Advanced search with filters
- [ ] Recommendation engine

### **Phase 4 - Analytics & Marketing**
- [ ] Google Analytics integration
- [ ] SEO optimization
- [ ] Social media sharing
- [ ] Newsletter management
- [ ] Discount & coupon system

## 🐛 **Testing**

### **API Testing:**
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### **Manual Testing:**
1. Test all API endpoints with curl/Postman
2. Verify frontend-backend integration
3. Test responsive design on different devices
4. Validate form submissions
5. Test error scenarios

## 📞 **Support & Contact**

- **Business:** Chandan Sarees
- **Website:** http://localhost:3000
- **API Docs:** http://localhost:3000/api
- **Email:** info@chandansarees.com
- **Phone:** +91 98765 43210

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎉 **Acknowledgments**

- **Unsplash** - Beautiful product images
- **Font Awesome** - Icon library
- **Google Fonts** - Typography
- **Express.js** - Web framework
- **Node.js** - Runtime environment

---

**Chandan Sarees** - Bringing traditional Indian elegance to the digital world with modern web technology! 🌟
