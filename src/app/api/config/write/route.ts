import { NextResponse } from "next/server";
import { writeConfig, backupConfig } from "@/lib/config-reader";

export const dynamic = "force-dynamic";

const ALLOWED_FILES = ["globalClaudeMd", "settings"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { file, content } = body;

    if (!file || typeof content !== "string") {
      return NextResponse.json(
        { error: "file and content are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILES.includes(file)) {
      return NextResponse.json(
        { error: `File not allowed. Allowed: ${ALLOWED_FILES.join(", ")}` },
        { status: 403 }
      );
    }

    const backupPath = backupConfig(file);
    writeConfig(file, content);

    return NextResponse.json({ ok: true, backupPath });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
