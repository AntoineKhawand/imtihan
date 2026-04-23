#!/bin/bash
# Security Scan Script using Shannon
# Run this to perform automated penetration testing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Imtihan Security Scanner ===${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    if [ -f ".env.local" ]; then
        source .env.local ANTHROPIC_API_KEY
    fi
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}Error: ANTHROPIC_API_KEY not set${NC}"
    echo "Please set your Anthropic API key:"
    echo "  export ANTHROPIC_API_KEY=your-api-key"
    exit 1
fi

# Configuration
TARGET_URL="${TARGET_URL:-http://localhost:3000}"
WORKSPACE_NAME="${WORKSPACE_NAME:-imtihan-scan-$(date +%Y%m%d-%H%M%S)}"
REPORT_DIR="./security-reports"
SCAN_MODE="${SCAN_MODE:-quick}"  # quick or full

echo -e "${YELLOW}Target:${NC} $TARGET_URL"
echo -e "${YELLOW}Workspace:${NC} $WORKSPACE_NAME"
echo ""

# Create report directory
mkdir -p "$REPORT_DIR"

# Check if target is running
echo -e "${YELLOW}Checking if target is running...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}Target is running!${NC}"
else
    echo -e "${RED}Target is not responding. Please start your app first:${NC}"
    echo "  npm run dev"
    exit 1
fi

echo ""
echo -e "${GREEN}Starting security scan...${NC}"
echo "This may take several minutes..."
echo ""

# Run Shannon scan
npx @keygraph/shannon start \
    -u "$TARGET_URL" \
    -r . \
    -w "$WORKSPACE_NAME" \
    -o "$REPORT_DIR" \
    --no-open \
    2>&1 || {
        echo -e "${RED}Scan failed. Check logs in $REPORT_DIR/${WORKSPACE_NAME}${NC}"
        exit 1
    }

# Generate summary
echo ""
echo -e "${GREEN}=== Scan Complete ===${NC}"
echo "Report saved to: $REPORT_DIR/${WORKSPACE_NAME}/deliverables/"

if [ -f "$REPORT_DIR/${WORKSPACE_NAME}/deliverables/comprehensive_security_assessment_report.md" ]; then
    echo ""
    echo -e "${YELLOW}=== Vulnerability Summary ===${NC}"
    
    # Count vulnerabilities by severity
    CRITICAL=$(grep -c "Critical\|critical" "$REPORT_DIR/${WORKSPACE_NAME}/deliverables/"*.md 2>/dev/null || echo "0")
    HIGH=$(grep -c "High\|high" "$REPORT_DIR/${WORKSPACE_NAME}/deliverables/"*.md 2>/dev/null || echo "0")
    MEDIUM=$(grep -c "Medium\|medium" "$REPORT_DIR/${WORKSPACE_NAME}/deliverables/"*.md 2>/dev/null || echo "0")
    LOW=$(grep -c "Low\|low" "$REPORT_DIR/${WORKSPACE_NAME}/deliverables/"*.md 2>/dev/null || echo "0")
    
    echo -e "Critical: $CRITICAL"
    echo -e "High:    $HIGH"
    echo -e "Medium: $MEDIUM"
    echo -e "Low:    $LOW"
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        echo -e "${RED}Warning: Critical or High vulnerabilities found!${NC}"
    fi
else
    echo "Report not found. Check workspace for details."
fi

echo ""
echo "To view full report:"
echo "  cat $REPORT_DIR/${WORKSPACE_NAME}/deliverables/comprehensive_security_assessment_report.md"