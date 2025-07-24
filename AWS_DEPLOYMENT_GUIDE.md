# 🚀 AWS EC2 Deployment Guide - Chandan Sarees E-commerce

## 🎯 **Quick Fix for "Telnet Works but HTTP Doesn't"**

You can telnet to port 3000 but HTTP requests fail? Here's the solution:

### **🔧 IMMEDIATE FIXES**

```bash
# 1. Run the diagnostic script first
npm run aws:debug

# 2. Most likely fix - restart server to bind to all interfaces
pkill -f "node.*server.js"
npm run aws:start

# 3. Test local connectivity
curl -v http://localhost:3000/health
curl -v http://$(hostname -I | awk '{print $1}'):3000/health
```

---

## 🚨 **Most Common Issues & Solutions**

### **1️⃣ Server Only Binding to Localhost (MOST LIKELY)**

**Problem:** Server binds to `127.0.0.1` instead of all interfaces
**Solution:** Server now binds to `0.0.0.0` (all interfaces)

**Fixed in code:**
```javascript
// Before: app.listen(PORT, () => {...})
// After:  app.listen(PORT, '0.0.0.0', () => {...})
```

### **2️⃣ AWS Security Group Misconfiguration**

**Problem:** Security Group blocks inbound traffic on port 3000
**Solution:** Add inbound rule in AWS Console

**Steps:**
1. Go to EC2 Console
2. Select your instance
3. Click "Security" tab
4. Click on Security Group name
5. Edit Inbound Rules
6. Add Rule:
   - **Type:** Custom TCP
   - **Port:** 3000
   - **Source:** 0.0.0.0/0 (or your IP)
   - **Description:** Node.js App

### **3️⃣ Linux Firewall Blocking Port**

**Problem:** `ufw` or `iptables` blocking port 3000
**Solution:** Allow port through firewall

```bash
# Ubuntu/Debian with ufw
sudo ufw allow 3000
sudo ufw status

# CentOS/RHEL with firewalld
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload

# Direct iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

---

## 📋 **Step-by-Step Deployment**

### **Prerequisites**
- AWS EC2 instance running Ubuntu/Amazon Linux
- Node.js installed (`node --version`)
- Your app files uploaded to EC2

### **1. Initial Setup**
```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Navigate to app directory
cd /path/to/your/app

# Install dependencies
npm install

# Set production environment
export NODE_ENV=production
export PORT=3000
```

### **2. Configure AWS Security Group**
```bash
# Get your instance details
aws ec2 describe-instances --instance-ids $(curl -s http://169.254.169.254/latest/meta-data/instance-id)

# Or in AWS Console:
# EC2 → Instances → Select Instance → Security → Edit Inbound Rules
# Add: Type=Custom TCP, Port=3000, Source=0.0.0.0/0
```

### **3. Start Application**
```bash
# Method 1: With diagnostic info
npm run aws:start

# Method 2: With debug logging
LOG_LEVEL=DEBUG PORT=3000 npm run start:logs

# Method 3: Basic start
npm start
```

### **4. Test Connectivity**
```bash
# Test locally (on EC2 instance)
curl -v http://localhost:3000/health
curl -v http://127.0.0.1:3000/health

# Test private IP (within AWS VPC)
curl -v http://$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4):3000/health

# Test public IP (from internet)
curl -v http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000/health
```

---

## 🔍 **Diagnostic Commands**

### **Run Full Diagnostics**
```bash
npm run aws:debug
```

This will check:
- ✅ System information
- ✅ Application status  
- ✅ Network configuration
- ✅ Firewall status
- ✅ AWS Security Group simulation
- ✅ Application logs
- ✅ Resource usage

### **Quick Health Checks**
```bash
# Check if Node.js is running
ps aux | grep node

# Check port binding
netstat -tlnp | grep :3000
ss -tlnp | grep :3000

# Check firewall status
sudo ufw status
sudo iptables -L INPUT

# Check logs
tail -f logs/app-$(date +%Y-%m-%d).log
```

---

## 🌐 **Network Troubleshooting**

### **Test Different Binding Addresses**
```bash
# Test if app responds on different interfaces
curl -v http://localhost:3000/health              # Loopback
curl -v http://127.0.0.1:3000/health             # Loopback IP
curl -v http://0.0.0.0:3000/health               # All interfaces
curl -v http://$(hostname -I):3000/health         # Private IP
```

### **Check Network Interfaces**
```bash
# List network interfaces
ip addr show
ifconfig

# Check routing
ip route show
route -n
```

### **Test External Connectivity**
```bash
# From another machine/internet
curl -v http://YOUR-EC2-PUBLIC-IP:3000/health

# With timeout (if hanging)
timeout 10 curl -v http://YOUR-EC2-PUBLIC-IP:3000/health
```

---

## 🛡️ **Security Configuration**

### **AWS Security Group Rules**
```
Inbound Rules:
┌─────────────┬──────┬──────────────┬─────────────────┐
│    Type     │ Port │   Protocol   │     Source      │
├─────────────┼──────┼──────────────┼─────────────────┤
│ SSH         │  22  │     TCP      │   Your IP/0.0.0.0/0  │
│ Custom TCP  │ 3000 │     TCP      │   0.0.0.0/0     │
│ HTTP        │  80  │     TCP      │   0.0.0.0/0     │
│ HTTPS       │ 443  │     TCP      │   0.0.0.0/0     │
└─────────────┴──────┴──────────────┴─────────────────┘

Outbound Rules:
┌─────────────┬──────┬──────────────┬─────────────────┐
│    Type     │ Port │   Protocol   │   Destination   │
├─────────────┼──────┼──────────────┼─────────────────┤
│ All Traffic │ All  │     All      │   0.0.0.0/0     │
└─────────────┴──────┴──────────────┴─────────────────┘
```

### **Ubuntu UFW Configuration**
```bash
# Check status
sudo ufw status

# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443

# Check again
sudo ufw status numbered
```

---

## 🚀 **Production Deployment Options**

### **Option 1: Direct Node.js (Simple)**
```bash
# Start in foreground (for testing)
npm run aws:start

# Start in background
nohup npm start > app.log 2>&1 &

# Check if running
ps aux | grep node
```

### **Option 2: PM2 Process Manager (Recommended)**
```bash
# Install PM2
sudo npm install -g pm2

# Start app with PM2
pm2 start npm --name "chandan-sarees" -- start

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs chandan-sarees
```

### **Option 3: Systemd Service**
```bash
# Create service file
sudo tee /etc/systemd/system/chandan-sarees.service > /dev/null <<EOF
[Unit]
Description=Chandan Sarees E-commerce App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable chandan-sarees
sudo systemctl start chandan-sarees
sudo systemctl status chandan-sarees
```

---

## 🔧 **Environment Configuration**

### **Environment Variables**
```bash
# Create production .env
cat > .env << EOF
NODE_ENV=production
PORT=3000
LOG_LEVEL=INFO
LOG_TO_FILE=true
LOG_REQUESTS=true

# Razorpay (use your real keys)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_secret_key

# CORS (restrict in production)
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
```

### **Domain Setup (Optional)**
```bash
# If using a domain name, update DNS records:
# A Record: yourdomain.com → EC2-PUBLIC-IP
# CNAME Record: www.yourdomain.com → yourdomain.com

# Test domain
curl -v http://yourdomain.com:3000/health
```

---

## 📊 **Monitoring & Logs**

### **Application Logs**
```bash
# View real-time logs
tail -f logs/app-$(date +%Y-%m-%d).log

# Search for errors
grep "ERROR" logs/app-*.log

# Monitor HTTP requests
grep "HTTP" logs/app-$(date +%Y-%m-%d).log | tail -20

# Watch for new requests
tail -f logs/app-$(date +%Y-%m-%d).log | grep "HTTP"
```

### **System Logs**
```bash
# System journal
sudo journalctl -u chandan-sarees -f

# Nginx logs (if using reverse proxy)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System resources
htop
free -h
df -h
```

---

## 🚨 **Emergency Troubleshooting**

### **If App Won't Start**
```bash
# Check for errors
npm run aws:debug

# Try starting manually
node server.js

# Check dependencies
npm install

# Check Node.js version
node --version
npm --version
```

### **If App Crashes**
```bash
# Check crash logs
grep "CRASHED\|ERROR\|FATAL" logs/app-*.log

# Check system resources
free -m
df -h

# Restart with debug
LOG_LEVEL=DEBUG npm start
```

### **If External Access Fails**
```bash
# Verify server is binding to all interfaces
netstat -tlnp | grep :3000

# Should show: 0.0.0.0:3000 or :::3000
# NOT: 127.0.0.1:3000

# Test from EC2 instance itself
curl -v http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000/health
```

---

## ✅ **Success Checklist**

After deployment, verify:

- [ ] ✅ Server starts without errors
- [ ] ✅ Port 3000 is bound to 0.0.0.0 (all interfaces)
- [ ] ✅ AWS Security Group allows port 3000
- [ ] ✅ Local firewall allows port 3000
- [ ] ✅ Local curl works: `curl http://localhost:3000/health`
- [ ] ✅ Private IP works: `curl http://PRIVATE-IP:3000/health`
- [ ] ✅ Public IP works: `curl http://PUBLIC-IP:3000/health`
- [ ] ✅ Logs are being written: `tail logs/app-$(date +%Y-%m-%d).log`
- [ ] ✅ Application responds correctly
- [ ] ✅ All API endpoints work

---

## 📞 **Getting Help**

If you're still having issues:

1. **Run the diagnostic script:**
   ```bash
   npm run aws:debug
   ```

2. **Share the output** along with:
   - EC2 instance type
   - Security Group configuration
   - Error messages from logs
   - Output of `curl -v http://localhost:3000/health`

3. **Common commands to include:**
   ```bash
   ps aux | grep node
   netstat -tlnp | grep :3000
   tail -20 logs/app-$(date +%Y-%m-%d).log
   ```

---

**🎉 Your Chandan Sarees E-commerce platform should now be accessible from the internet on your EC2 instance!**

**Access URLs:**
- **Direct:** `http://YOUR-EC2-PUBLIC-IP:3000`
- **Health Check:** `http://YOUR-EC2-PUBLIC-IP:3000/health`
- **API Docs:** `http://YOUR-EC2-PUBLIC-IP:3000/api`