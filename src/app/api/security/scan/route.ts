import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";

const execAsync = promisify(exec);

const execSync = promisify((cmd: string, opts: object, cb: (err: Error, stdout: string, stderr: string) => void) => {
  exec(cmd, opts, (err, stdout, stderr) => cb(err, stdout, stderr);
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUrl, workspace, fullScan } = body;

    const target = targetUrl || "http://localhost:3000";
    const wsName = workspace || `api-scan-${Date.now()}`;
    
    const reportDir = join(process.cwd(), "security-reports");
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    return NextResponse.json({
      success: true,
      message: "Security scan initiated",
      workspace: wsName,
      target,
      status: "running",
      reportLocation: `${reportDir}/${wsName}`,
      note: "Scan runs in background. Use GET check status."
    }, { status: 202 });

  } catch (error) {
    console.error("[Security Scan]", error);
    return NextResponse.json(
      { success: false, error: "Scan failed to start" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspace = searchParams.get("workspace");
  
  if (!workspace) {
    const reportDir = join(process.cwd(), "security-reports");
    return NextResponse.json({
      available_scans: existsSync(reportDir) 
        ? require("fs").readdirSync(reportDir).filter(f => f.startsWith("imtihan"))
        : []
    });
  }

  const reportPath = join(process.cwd(), "security-reports", workspace, "deliverables");
  
  if (!existsSync(join(reportPath, "comprehensive_security_assessment_report.md"))) {
    return NextResponse.json({
      workspace,
      status: "not_found",
      message: "Scan not found or still running"
    }, { status: 404 });
  }

  return NextResponse.json({
    workspace,
    status: "complete",
    report: `${reportPath}/comprehensive_security_assessment_report.md`
  });
}