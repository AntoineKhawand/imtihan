# Security Integration

This project integrates **Shannon** by Keygraph for automated AI-powered penetration testing.

## What's Included

| File | Purpose |
|------|---------|
| `scripts/security-scan.sh` | Manual security scan script |
| `.github/workflows/security.yml` | CI/CD automated scans |
| `src/app/api/security/route.ts` | On-demand scan API |

## Prerequisites

1. **Docker** - Must be running
2. **Anthropic API Key** - Get from [console.anthropic.com](https://console.anthropic.com)

## Usage

### 1. Manual Security Scan

```bash
# Set your API key
export ANTHROPIC_API_KEY=your-key

# Start your app
npm run dev

# Run security scan
bash scripts/security-scan.sh
```

### 2. CI/CD Integration (GitHub Actions)

The workflow runs:
- On every push to main/develop
- On every pull request
- Weekly (Sundays at 2 AM)
- Manually via workflow dispatch

**Required secrets:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key

### 3. On-Demand API

```bash
# Trigger scan for authenticated users
POST /api/security?token=<firebase-token>
{
  "targetUrl": "https://your-production-url.com"
}

# Get scan status
GET /api/security?workspace=scan-123
```

## Security Reports

Reports are saved to:
- Manual: `security-reports/`
- CI/CD: `security-reports/` (uploaded as artifacts)
- API: Returns workspace name for retrieval

## Disclaimers

⚠️ **Important:**
- Shannon is a white-box pentesting tool - it expects access to source code
- DO NOT run against production without explicit authorization
- Review all findings before taking action
- This integration is for educational/testing purposes

## Cost

Shannon uses Claude API credits. Monitor your usage at [console.anthropic.com](https://console.anthropic.com)