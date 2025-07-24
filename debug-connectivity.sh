#!/bin/bash

echo "🔍 COMPREHENSIVE CONNECTIVITY DEBUGGING"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }

echo ""
echo "1️⃣ SYSTEM AND NETWORK INFORMATION"
echo "=================================="

print_info "Current user and hostname:"
echo "User: $(whoami)"
echo "Hostname: $(hostname)"
echo "Hostname -f: $(hostname -f 2>/dev/null || echo 'N/A')"

print_info "IP Addresses:"
echo "hostname -I: $(hostname -I 2>/dev/null || echo 'N/A')"

print_info "Network interfaces from /proc/net/dev:"
cat /proc/net/dev | grep -E "(eth|ens|docker)" | head -10

print_info "Default gateway from /proc/net/route:"
awk 'NR==1{print $1,$2,$3} NR>1 && $2=="00000000"{print $1,$3,"(default)"}' /proc/net/route

echo ""
echo "2️⃣ APPLICATION STATUS DETAILED"
echo "=============================="

print_info "Node.js processes:"
ps aux | grep -E "(node|server)" | grep -v grep

print_info "Port 3000 binding details:"
echo "From /proc/net/tcp (port 3000 = 0BB8 in hex):"
grep ":0BB8" /proc/net/tcp || echo "Port 3000 not found in TCP table"

print_info "Process using port 3000:"
if command -v lsof >/dev/null 2>&1; then
    lsof -i :3000 2>/dev/null || echo "No process found on port 3000"
else
    echo "lsof not available"
fi

echo ""
echo "3️⃣ LOCAL CONNECTIVITY TESTS"
echo "============================"

# Test localhost variants
for host in localhost 127.0.0.1 0.0.0.0 $(hostname -I | awk '{print $1}'); do
    if [ -n "$host" ] && [ "$host" != "" ]; then
        print_info "Testing $host:3000..."
        if timeout 10 curl -f --connect-timeout 5 -s "http://$host:3000/health" >/dev/null 2>&1; then
            print_success "✅ $host:3000 responds"
            # Get actual response
            response=$(timeout 5 curl -s "http://$host:3000/health" 2>/dev/null | head -c 50)
            echo "   Response: $response..."
        else
            print_error "❌ $host:3000 failed"
            # Try to get more details
            timeout 5 curl -v "http://$host:3000/health" 2>&1 | head -5
        fi
        echo ""
    fi
done

echo ""
echo "4️⃣ FIREWALL AND SECURITY ANALYSIS"
echo "=================================="

print_info "Checking for iptables rules:"
if command -v iptables >/dev/null 2>&1; then
    if sudo iptables -L INPUT -n 2>/dev/null | grep -q "3000\|ACCEPT"; then
        print_info "iptables rules for INPUT chain:"
        sudo iptables -L INPUT -n 2>/dev/null | head -10
    else
        print_warning "No specific iptables rules found for port 3000"
    fi
else
    print_warning "iptables command not available"
fi

print_info "Checking for ufw status:"
if command -v ufw >/dev/null 2>&1; then
    sudo ufw status 2>/dev/null || print_warning "Could not check ufw status"
else
    print_warning "ufw not available"
fi

print_info "Checking systemd services that might block traffic:"
if command -v systemctl >/dev/null 2>&1; then
    systemctl list-units --type=service --state=active | grep -E "(firewall|iptables|ufw)" || echo "No firewall services found"
else
    print_warning "systemctl not available"
fi

echo ""
echo "5️⃣ CLOUD METADATA AND EXTERNAL CONNECTIVITY"
echo "============================================"

print_info "Attempting to get AWS metadata:"
PUBLIC_IP=$(timeout 5 curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
PRIVATE_IP=$(timeout 5 curl -s http://169.254.169.254/latest/meta-data/local-ipv4 2>/dev/null)
INSTANCE_ID=$(timeout 5 curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
AZ=$(timeout 5 curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone 2>/dev/null)

if [ -n "$PUBLIC_IP" ]; then
    print_success "Public IP: $PUBLIC_IP"
else
    print_warning "Could not retrieve public IP (instance might not have public IP)"
fi

if [ -n "$PRIVATE_IP" ]; then
    print_success "Private IP: $PRIVATE_IP"
else
    print_warning "Could not retrieve private IP"
fi

if [ -n "$INSTANCE_ID" ]; then
    print_info "Instance ID: $INSTANCE_ID"
fi

if [ -n "$AZ" ]; then
    print_info "Availability Zone: $AZ"
fi

echo ""
echo "6️⃣ APPLICATION LOGS ANALYSIS"
echo "============================"

print_info "Recent application logs:"
if [ -f "logs/app-$(date +%Y-%m-%d).log" ]; then
    echo "Last 15 lines from today's log:"
    tail -15 "logs/app-$(date +%Y-%m-%d).log"
else
    print_warning "No log file found for today"
    echo "Available log files:"
    ls -la logs/ 2>/dev/null || echo "No logs directory found"
fi

echo ""
echo "7️⃣ SERVER CONFIGURATION CHECK"
echo "============================="

print_info "Checking server.js binding configuration:"
if [ -f "server.js" ]; then
    grep -n "listen\|bind\|0\.0\.0\.0\|localhost" server.js | head -5
else
    print_warning "server.js not found in current directory"
fi

print_info "Environment variables:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "PORT: ${PORT:-'not set'}"
echo "LOG_LEVEL: ${LOG_LEVEL:-'not set'}"

echo ""
echo "8️⃣ NETWORK DIAGNOSTIC COMMANDS"
echo "=============================="

print_info "Testing external DNS resolution:"
if timeout 5 nslookup google.com >/dev/null 2>&1; then
    print_success "✅ DNS resolution works"
else
    print_error "❌ DNS resolution failed"
fi

print_info "Testing outbound connectivity:"
if timeout 5 curl -s http://httpbin.org/ip >/dev/null 2>&1; then
    print_success "✅ Outbound HTTP works"
    EXTERNAL_IP=$(timeout 5 curl -s http://httpbin.org/ip 2>/dev/null | grep -o '"origin":"[^"]*"' | cut -d'"' -f4)
    echo "   External IP seen by internet: $EXTERNAL_IP"
else
    print_error "❌ Outbound HTTP failed"
fi

echo ""
echo "9️⃣ SECURITY GROUP SIMULATION"
echo "============================"

if [ -n "$PUBLIC_IP" ]; then
    print_info "Testing if port 3000 is accessible from outside (this may fail due to Security Group):"
    print_info "Attempting external connection to $PUBLIC_IP:3000..."
    
    # This will likely fail due to security group, but shows the attempt
    timeout 10 curl -f --connect-timeout 5 "http://$PUBLIC_IP:3000/health" 2>/dev/null && \
        print_success "✅ External access works!" || \
        print_error "❌ External access failed (likely Security Group issue)"
else
    print_warning "No public IP available for external testing"
fi

echo ""
echo "🔧 RECOMMENDATIONS BASED ON FINDINGS"
echo "===================================="

print_info "Based on the diagnostics above:"

echo ""
echo "1. If local connectivity works but external doesn't:"
echo "   → Check AWS Security Group settings"
echo "   → Ensure inbound rule allows TCP port 3000 from 0.0.0.0/0"

echo ""
echo "2. If you see a public IP but external access fails:"
echo "   → 99% likely a Security Group configuration issue"
echo "   → Go to EC2 Console → Security Groups → Edit Inbound Rules"

echo ""
echo "3. If no public IP is shown:"
echo "   → Instance doesn't have a public IP assigned"
echo "   → Either assign an Elastic IP or use Application Load Balancer"

echo ""
echo "4. If local connectivity also fails:"
echo "   → Check if application is binding to 0.0.0.0 instead of localhost"
echo "   → Check for local firewall rules blocking port 3000"

echo ""
echo "✅ DEBUGGING COMPLETE"
echo "===================="
print_success "Diagnostic script completed!"
print_info "Share this output with the relevant sections highlighted for further assistance."