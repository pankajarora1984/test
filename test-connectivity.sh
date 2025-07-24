#!/bin/bash

echo "🔧 SIMPLE CONNECTIVITY TESTER"
echo "============================="

# Function to test with timeout
test_curl() {
    local url=$1
    local timeout=$2
    local description=$3
    
    echo ""
    echo "Testing: $description"
    echo "URL: $url"
    echo "Timeout: ${timeout}s"
    echo "---"
    
    if timeout $timeout curl -f --connect-timeout 3 --max-time $timeout "$url" >/dev/null 2>&1; then
        echo "✅ SUCCESS"
    else
        echo "❌ FAILED or TIMEOUT"
        echo "Trying with verbose output:"
        timeout $timeout curl -v --connect-timeout 3 --max-time $timeout "$url" 2>&1 | head -10
    fi
}

# Check if server is running
echo "1. Checking if Node.js server is running:"
SERVER_PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
if [ -n "$SERVER_PID" ]; then
    echo "✅ Server running (PID: $SERVER_PID)"
else
    echo "❌ Server not running"
    echo "Starting server..."
    nohup node server.js > server.log 2>&1 &
    sleep 3
    echo "Waiting for server to start..."
fi

# Check port binding
echo ""
echo "2. Checking port 3000 binding:"
if grep -q ":0BB8" /proc/net/tcp 2>/dev/null; then
    echo "✅ Port 3000 is bound"
else
    echo "❌ Port 3000 not bound"
fi

# Test different variations
test_curl "http://localhost:3000/health" 5 "localhost with 5s timeout"
test_curl "http://127.0.0.1:3000/health" 5 "127.0.0.1 with 5s timeout"
test_curl "http://localhost:3000/health" 10 "localhost with 10s timeout"
test_curl "http://localhost:3000/health" 2 "localhost with 2s timeout (quick test)"

# Test with actual IP
LOCAL_IP=$(hostname -I | awk '{print $1}')
if [ -n "$LOCAL_IP" ]; then
    test_curl "http://$LOCAL_IP:3000/health" 5 "Local IP ($LOCAL_IP) with 5s timeout"
fi

echo ""
echo "3. Testing different endpoints:"
test_curl "http://localhost:3000/" 5 "Main website"
test_curl "http://localhost:3000/api" 5 "API documentation"

echo ""
echo "4. Manual curl test (try this yourself):"
echo "Run this command and see if it hangs:"
echo "curl -v --connect-timeout 5 --max-time 10 http://localhost:3000/health"

echo ""
echo "5. If curl still hangs, try:"
echo "   - Check your terminal/SSH session"
echo "   - Try from a different terminal window"
echo "   - Check if you have any network proxies"
echo "   - Try: strace -e trace=network curl http://localhost:3000/health"

echo ""
echo "✅ Test completed!"