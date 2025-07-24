# 🐛 Chandan Sarees E-commerce - Debugging & Logging Guide

## 📄 **Log Files Location**

### **Default Log Directory:**
```bash
./logs/
```

### **Log File Naming:**
- **Pattern:** `app-YYYY-MM-DD.log`
- **Today's Log:** `app-$(date +%Y-%m-%d).log`
- **Example:** `app-2025-07-24.log`

### **Log File Structure:**
```
[TIMESTAMP] [LEVEL] MESSAGE {JSON_METADATA}
```

**Example:**
```
[2025-07-24T04:10:38.434Z] [INFO] 🎉 Server Started {"port":"3000","environment":"development"}
```

---

## 🚀 **Starting Server with Enhanced Logging**

### **Method 1: Enhanced Startup Script**
```bash
npm run start:logs
```
This will show:
- ✅ Log file location
- 🔧 Monitoring commands
- 🧪 API testing commands
- 📊 Real-time startup information

### **Method 2: Development with Debug Logging**
```bash
npm run dev:logs
```
This enables `DEBUG` level logging with auto-restart.

### **Method 3: Manual with Custom Log Level**
```bash
LOG_LEVEL=DEBUG npm start
```

---

## 📊 **Log Levels**

| Level | Description | When to Use |
|-------|-------------|-------------|
| **ERROR** | 🔴 Critical errors | System failures, payment errors |
| **WARN** | 🟡 Warning messages | Performance issues, deprecated features |
| **INFO** | 🔵 General information | HTTP requests, business events |
| **DEBUG** | ⚪ Detailed debugging | Development, troubleshooting |

### **Set Log Level:**
```bash
# Environment variable
export LOG_LEVEL=DEBUG

# Or in .env file
LOG_LEVEL=DEBUG
```

---

## 🔍 **Monitoring Commands**

### **Real-time Log Monitoring:**
```bash
# Follow all logs
tail -f logs/app-$(date +%Y-%m-%d).log

# Follow with color highlighting
tail -f logs/app-$(date +%Y-%m-%d).log | grep --color=always -E "(ERROR|WARN|INFO|DEBUG)"

# Follow only errors
tail -f logs/app-$(date +%Y-%m-%d).log | grep "ERROR"

# View logs with npm script
npm run logs:view
```

### **Search & Filter Logs:**
```bash
# Find all errors today
grep "ERROR" logs/app-$(date +%Y-%m-%d).log

# Count errors
grep -c "ERROR" logs/app-$(date +%Y-%m-%d).log

# Find specific API calls
grep "HTTP GET" logs/app-$(date +%Y-%m-%d).log

# Find cart operations
grep "cart" logs/app-$(date +%Y-%m-%d).log

# Find payment operations
grep -i "payment\|razorpay" logs/app-$(date +%Y-%m-%d).log

# Search with npm script
npm run logs:errors
```

### **Advanced Log Analysis:**
```bash
# API response times
grep "duration" logs/app-$(date +%Y-%m-%d).log | grep -o '"duration":"[^"]*"'

# Most frequent API calls
grep "HTTP" logs/app-$(date +%Y-%m-%d).log | awk '{print $5}' | sort | uniq -c | sort -nr

# Find slow requests (>1000ms)
grep "duration" logs/app-$(date +%Y-%m-%d).log | grep -E "[0-9]{4,}ms"

# Error patterns
grep "ERROR" logs/app-$(date +%Y-%m-%d).log | cut -d']' -f3 | sort | uniq -c
```

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Server Not Starting**

**Symptoms:**
- No log file created
- Port already in use error
- Module not found errors

**Debug Steps:**
```bash
# Check if port is in use
lsof -i :3000
netstat -tulpn | grep :3000

# Kill existing process
pkill -f "node.*server.js"

# Check for missing modules
npm install

# Start with debug logging
LOG_LEVEL=DEBUG npm start
```

**Common Log Messages:**
```
[ERROR] Error: listen EADDRINUSE :::3000
[ERROR] Cannot find module './routes/products'
[ERROR] SyntaxError: Unexpected token
```

### **Issue 2: API Requests Hanging/Timeout**

**Symptoms:**
- `curl` commands hang
- No response from API
- Browser requests timeout

**Debug Steps:**
```bash
# Check server process
ps aux | grep node

# Check server logs for requests
tail -f logs/app-$(date +%Y-%m-%d).log | grep "HTTP"

# Test with timeout
curl --max-time 10 http://localhost:3000/health

# Check specific endpoint
curl -v http://localhost:3000/api/products
```

**Look for in Logs:**
```
[INFO] HTTP GET /api/products {"status":200,"duration":"50ms"}
[ERROR] 💥 Unhandled server error
[WARN] 🔍 API endpoint not found
```

### **Issue 3: Database/Cart Issues**

**Symptoms:**
- Cart not persisting
- Product data not loading
- Orders not creating

**Debug Steps:**
```bash
# Check cart operations
grep -A5 -B5 "cart" logs/app-$(date +%Y-%m-%d).log

# Test cart API directly
curl -X POST http://localhost:3000/api/cart/test/add \
  -H "Content-Type: application/json" \
  -d '{"productId":"1","quantity":1}'

# Check product loading
curl http://localhost:3000/api/products | jq .
```

**Look for in Logs:**
```
[DEBUG] 📥 Getting cart for user {"userId":"test"}
[INFO] API GET /cart/:userId {"status":200,"duration":"0ms"}
[ERROR] Product not found
```

### **Issue 4: Payment Gateway Issues**

**Symptoms:**
- Payment not processing
- Order creation fails
- Razorpay errors

**Debug Steps:**
```bash
# Check payment logs
grep -i "payment\|razorpay" logs/app-$(date +%Y-%m-%d).log

# Verify environment variables
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Test order creation
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","cartId":"123","shippingAddress":{...}}'
```

**Look for in Logs:**
```
[INFO] Payment completed for order CS123456789
[ERROR] Razorpay order creation failed
[ERROR] Payment verification failed
```

---

## 📈 **Performance Monitoring**

### **Response Time Analysis:**
```bash
# Find slow API calls
grep "duration" logs/app-$(date +%Y-%m-%d).log | awk -F'"duration":"' '{print $2}' | awk -F'ms' '{print $1}' | sort -n | tail -10

# Average response time
grep "duration" logs/app-$(date +%Y-%m-%d).log | awk -F'"duration":"' '{print $2}' | awk -F'ms' '{sum+=$1; count++} END {print "Average:", sum/count "ms"}'
```

### **Memory Usage Tracking:**
```bash
# Memory usage from health checks
grep "memory" logs/app-$(date +%Y-%m-%d).log | tail -1
```

### **Request Volume:**
```bash
# Total API requests today
grep "HTTP" logs/app-$(date +%Y-%m-%d).log | wc -l

# Requests per hour
grep "HTTP" logs/app-$(date +%Y-%m-%d).log | cut -d'T' -f2 | cut -d':' -f1 | sort | uniq -c
```

---

## 🧪 **API Testing Commands**

### **Health & Status:**
```bash
# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000/api

# Server status
curl -I http://localhost:3000
```

### **Products API:**
```bash
# Get all products
curl http://localhost:3000/api/products

# Get specific product
curl http://localhost:3000/api/products/1

# Get products by category
curl http://localhost:3000/api/products/category/silk-sarees

# Search products
curl "http://localhost:3000/api/products?search=silk&limit=5"
```

### **Cart API:**
```bash
# Get cart
curl http://localhost:3000/api/cart/test_user

# Add to cart
curl -X POST http://localhost:3000/api/cart/test_user/add \
  -H "Content-Type: application/json" \
  -d '{"productId":"1","quantity":1,"selectedSize":"Free Size","selectedColor":"Red"}'

# Update cart item
curl -X PUT http://localhost:3000/api/cart/test_user/update/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"quantity":2}'

# Remove from cart
curl -X DELETE http://localhost:3000/api/cart/test_user/remove/ITEM_ID

# Apply coupon
curl -X POST http://localhost:3000/api/cart/test_user/apply-coupon \
  -H "Content-Type: application/json" \
  -d '{"couponCode":"WELCOME10"}'
```

### **Orders API:**
```bash
# Create order
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"test_user",
    "cartId":"cart_123",
    "shippingAddress":{
      "fullName":"Test User",
      "email":"test@example.com",
      "phone":"9876543210",
      "address":"123 Test St",
      "city":"Mumbai",
      "state":"Maharashtra",
      "pincode":"400001"
    },
    "paymentMethod":"cod"
  }'

# Get user orders
curl http://localhost:3000/api/orders/test_user

# Track order
curl http://localhost:3000/api/orders/track/CS123456789
```

---

## 🔧 **Log Management**

### **Clear Old Logs:**
```bash
# Clear all log files
npm run logs:clear

# Clear logs older than 7 days
find logs/ -name "*.log" -mtime +7 -delete

# Compress old logs
gzip logs/app-$(date -d "yesterday" +%Y-%m-%d).log
```

### **Log Rotation:**
```bash
# Create log rotation script
cat > scripts/rotate-logs.sh << 'EOF'
#!/bin/bash
cd /path/to/your/app
find logs/ -name "*.log" -mtime +7 -exec gzip {} \;
find logs/ -name "*.gz" -mtime +30 -delete
EOF

chmod +x scripts/rotate-logs.sh

# Add to crontab for daily rotation
# 0 2 * * * /path/to/your/app/scripts/rotate-logs.sh
```

---

## 🚨 **Emergency Debugging**

### **Quick Health Check:**
```bash
# One-liner to check everything
curl -s http://localhost:3000/health | jq . && echo "✅ Server OK" || echo "❌ Server Down"
```

### **Restart with Full Debugging:**
```bash
# Kill and restart with max logging
pkill -f "node.*server.js"
LOG_LEVEL=DEBUG LOG_REQUESTS=true npm run start:logs
```

### **Emergency Log Analysis:**
```bash
# Last 100 lines with errors highlighted
tail -100 logs/app-$(date +%Y-%m-%d).log | grep --color=always -E "(ERROR|WARN|✅|❌|💥)"

# Critical error summary
grep "ERROR\|💥\|WARN" logs/app-$(date +%Y-%m-%d).log | tail -20
```

---

## 🔍 **Deployment Debugging**

### **Production Issues:**
```bash
# Check process status
pm2 status  # if using PM2
supervisorctl status  # if using Supervisor

# Check system logs
sudo journalctl -u your-app-name -f

# Check disk space
df -h

# Check memory usage
free -m

# Check CPU usage
top -p $(pgrep -f "node.*server.js")
```

### **Network Issues:**
```bash
# Check if app is listening
netstat -tlnp | grep :3000

# Check firewall
sudo ufw status

# Test from external
curl -I http://your-domain.com/health
```

---

## 📱 **Quick Reference Commands**

```bash
# Start with logging
npm run start:logs

# View logs
tail -f logs/app-$(date +%Y-%m-%d).log

# Find errors
grep "ERROR" logs/app-$(date +%Y-%m-%d).log

# Test API
curl http://localhost:3000/health

# Check process
ps aux | grep node

# Restart server
pkill -f "node.*server.js" && npm start
```

---

## 💡 **Pro Tips**

1. **Always check logs first** - 90% of issues are visible in logs
2. **Use specific log levels** - DEBUG for development, INFO for production
3. **Monitor response times** - Look for performance degradation
4. **Check error patterns** - Recurring errors indicate systematic issues
5. **Test APIs directly** - Isolate frontend vs backend issues
6. **Keep logs for 30 days** - Essential for debugging intermittent issues

---

## 📞 **Need Help?**

If you're still experiencing issues:

1. **Gather Information:**
   - Current log file: `logs/app-$(date +%Y-%m-%d).log`
   - Error messages from console
   - Steps to reproduce the issue

2. **Check Environment:**
   - Node.js version: `node --version`
   - Dependencies: `npm list`
   - Environment variables: Check `.env` file

3. **Test Basic Functionality:**
   - Health check: `curl http://localhost:3000/health`
   - API docs: `curl http://localhost:3000/api`

---

**🎉 Happy Debugging! The logs are your best friend for troubleshooting the Chandan Sarees E-commerce Platform.**