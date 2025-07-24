#!/bin/bash

echo "🚀 AWS EC2 Deployment Debugging Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo ""
print_status "🔍 Starting comprehensive AWS EC2 diagnostics..."
echo ""

# 1. Basic System Information
echo "1️⃣  SYSTEM INFORMATION"
echo "====================="
print_status "OS Version:"
cat /etc/os-release | grep PRETTY_NAME
print_status "Current User: $(whoami)"
print_status "Current Directory: $(pwd)"
print_status "Hostname: $(hostname)"
print_status "Instance ID: $(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || echo 'Not available')"
print_status "Public IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'Not available')"
print_status "Private IP: $(curl -s http://169.254.169.254/latest/meta-data/local-ipv4 2>/dev/null || echo 'Not available')"
echo ""

# 2. Node.js Application Status
echo "2️⃣  APPLICATION STATUS"
echo "======================"
print_status "Checking Node.js processes:"
NODE_PROCESSES=$(ps aux | grep node | grep -v grep)
if [ -n "$NODE_PROCESSES" ]; then
    print_success "Node.js processes found:"
    echo "$NODE_PROCESSES"
else
    print_error "No Node.js processes running!"
fi

print_status "Checking for server.js specifically:"
SERVER_PROCESS=$(ps aux | grep server.js | grep -v grep)
if [ -n "$SERVER_PROCESS" ]; then
    print_success "server.js is running:"
    echo "$SERVER_PROCESS"
else
    print_error "server.js is not running!"
fi
echo ""

# 3. Port and Network Status
echo "3️⃣  NETWORK CONFIGURATION"
echo "========================="
print_status "Checking port 3000 binding:"
PORT_BINDING=$(netstat -tlnp 2>/dev/null | grep :3000 || ss -tlnp | grep :3000)
if [ -n "$PORT_BINDING" ]; then
    print_success "Port 3000 is bound:"
    echo "$PORT_BINDING"
else
    print_error "Port 3000 is not bound!"
fi

print_status "Checking all listening ports:"
netstat -tlnp 2>/dev/null | head -10 || ss -tlnp | head -10

print_status "Testing local connectivity:"
LOCAL_TEST=$(curl -s --max-time 5 http://localhost:3000/health 2>/dev/null)
if [ -n "$LOCAL_TEST" ]; then
    print_success "Local curl works: $LOCAL_TEST"
else
    print_error "Local curl failed!"
    # Try with different addresses
    print_status "Trying 127.0.0.1:3000..."
    curl -s --max-time 5 http://127.0.0.1:3000/health || print_error "127.0.0.1 failed"
    
    print_status "Trying 0.0.0.0:3000..."
    curl -s --max-time 5 http://0.0.0.0:3000/health || print_error "0.0.0.0 failed"
fi
echo ""

# 4. Firewall Configuration
echo "4️⃣  FIREWALL STATUS"
echo "==================="
print_status "Checking iptables rules:"
if command -v iptables >/dev/null 2>&1; then
    IPTABLES_RULES=$(sudo iptables -L INPUT -n 2>/dev/null)
    if [ -n "$IPTABLES_RULES" ]; then
        echo "$IPTABLES_RULES"
    else
        print_warning "Could not read iptables rules (may need sudo)"
    fi
else
    print_warning "iptables not found"
fi

print_status "Checking ufw status:"
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null)
    echo "$UFW_STATUS"
else
    print_warning "ufw not found"
fi

print_status "Checking for other firewall services:"
systemctl list-units --type=service | grep -E "(firewall|iptables)" || print_warning "No firewall services found"
echo ""

# 5. AWS Security Group Simulation
echo "5️⃣  AWS SECURITY GROUP CHECK"
echo "============================"
print_status "Testing external connectivity (simulating Security Group):"

# Get instance metadata
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4 2>/dev/null)

if [ -n "$PUBLIC_IP" ]; then
    print_status "Testing public IP access ($PUBLIC_IP:3000):"
    timeout 10 curl -s http://$PUBLIC_IP:3000/health && print_success "Public IP accessible" || print_error "Public IP not accessible"
else
    print_warning "Could not determine public IP"
fi

if [ -n "$PRIVATE_IP" ]; then
    print_status "Testing private IP access ($PRIVATE_IP:3000):"
    timeout 10 curl -s http://$PRIVATE_IP:3000/health && print_success "Private IP accessible" || print_error "Private IP not accessible"
else
    print_warning "Could not determine private IP"
fi

print_status "Security Group Requirements:"
echo "  ✅ Inbound Rule: HTTP (80) from 0.0.0.0/0 OR Custom TCP (3000) from 0.0.0.0/0"
echo "  ✅ Outbound Rule: All traffic to 0.0.0.0/0 (default)"
echo ""

# 6. Application Configuration
echo "6️⃣  APPLICATION CONFIGURATION"
echo "============================="
print_status "Checking environment variables:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "PORT: ${PORT:-'not set'}"
echo "LOG_LEVEL: ${LOG_LEVEL:-'not set'}"

print_status "Checking application logs:"
if [ -f "logs/app-$(date +%Y-%m-%d).log" ]; then
    print_success "Log file exists, showing last 10 lines:"
    tail -10 "logs/app-$(date +%Y-%m-%d).log"
else
    print_warning "No log file found for today"
    print_status "Looking for any log files:"
    ls -la logs/ 2>/dev/null || print_warning "No logs directory found"
fi

print_status "Checking if server binds to all interfaces:"
if [ -f "server.js" ]; then
    BIND_CHECK=$(grep -n "app.listen" server.js)
    if [ -n "$BIND_CHECK" ]; then
        print_status "Server listen configuration:"
        echo "$BIND_CHECK"
        
        # Check if it's binding to 0.0.0.0
        if grep -q "0.0.0.0" server.js; then
            print_success "Server configured to bind to all interfaces (0.0.0.0)"
        else
            print_warning "Server may not be binding to all interfaces"
            print_status "Consider changing to: app.listen(PORT, '0.0.0.0', callback)"
        fi
    fi
else
    print_error "server.js not found in current directory"
fi
echo ""

# 7. Network Interface Information
echo "7️⃣  NETWORK INTERFACES"
echo "======================"
print_status "Network interfaces:"
ip addr show 2>/dev/null || ifconfig 2>/dev/null || print_error "Could not get network interface info"
echo ""

# 8. DNS and Routing
echo "8️⃣  DNS AND ROUTING"
echo "==================="
print_status "Default route:"
ip route show default 2>/dev/null || route -n | grep "^0.0.0.0" 2>/dev/null

print_status "DNS configuration:"
if [ -f "/etc/resolv.conf" ]; then
    cat /etc/resolv.conf | grep nameserver
else
    print_warning "Could not read /etc/resolv.conf"
fi
echo ""

# 9. Resource Usage
echo "9️⃣  SYSTEM RESOURCES"
echo "===================="
print_status "Memory usage:"
free -h

print_status "Disk usage:"
df -h | head -5

print_status "CPU load:"
uptime
echo ""

# 10. Recommendations
echo "🔧 TROUBLESHOOTING RECOMMENDATIONS"
echo "=================================="

print_status "Based on the diagnostics above, here are the most likely issues:"
echo ""

echo "1️⃣  APPLICATION NOT BINDING TO ALL INTERFACES:"
echo "   Problem: App only binds to localhost (127.0.0.1)"
echo "   Solution: Modify server.js to bind to 0.0.0.0"
echo "   Code: app.listen(PORT, '0.0.0.0', () => { ... })"
echo ""

echo "2️⃣  AWS SECURITY GROUP MISCONFIGURATION:"
echo "   Problem: Security Group doesn't allow inbound traffic on port 3000"
echo "   Solution: Add inbound rule in AWS Console:"
echo "   - Type: Custom TCP"
echo "   - Port: 3000"
echo "   - Source: 0.0.0.0/0 (or your IP range)"
echo ""

echo "3️⃣  FIREWALL BLOCKING CONNECTIONS:"
echo "   Problem: Local firewall (iptables/ufw) blocking port 3000"
echo "   Solution: Allow port 3000 through firewall"
echo "   Commands:"
echo "   sudo ufw allow 3000"
echo "   sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT"
echo ""

echo "4️⃣  APPLICATION NOT RUNNING:"
echo "   Problem: Node.js server crashed or not started"
echo "   Solution: Start the server with logging"
echo "   Commands:"
echo "   npm run start:logs"
echo "   LOG_LEVEL=DEBUG npm start"
echo ""

# 11. Quick Fix Commands
echo "🚨 QUICK FIX COMMANDS"
echo "===================="
print_status "Try these commands in order:"
echo ""

echo "1. Check if app is running and restart if needed:"
echo "   pkill -f 'node.*server.js'"
echo "   npm run start:logs"
echo ""

echo "2. Test local connectivity:"
echo "   curl -v http://localhost:3000/health"
echo "   curl -v http://127.0.0.1:3000/health"
echo "   curl -v http://\$(hostname -I | awk '{print \$1}'):3000/health"
echo ""

echo "3. Check AWS Security Group (in AWS Console):"
echo "   EC2 → Instances → Select Instance → Security Groups → Edit Inbound Rules"
echo "   Add: Type=Custom TCP, Port=3000, Source=0.0.0.0/0"
echo ""

echo "4. Open firewall if needed:"
echo "   sudo ufw allow 3000"
echo "   sudo systemctl reload ufw"
echo ""

echo "5. Test external connectivity:"
echo "   curl -v http://\$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000/health"
echo ""

# 12. Final Status
echo "✅ DIAGNOSTIC COMPLETE"
echo "====================="
print_success "Diagnostic script completed!"
print_status "Check the output above for any red [ERROR] messages"
print_status "Log file location: logs/app-\$(date +%Y-%m-%d).log"
print_status "For support, share this diagnostic output"
echo ""