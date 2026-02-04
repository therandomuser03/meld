import { NextResponse } from "next/server";
import { LingoDotDevEngine } from "lingo.dev/sdk";

const lingo = new LingoDotDevEngine({
  apiKey: process.env.LINGO_API_KEY as string,
});

export async function POST(req: Request) {
  try {
    const { content, targetLocale, format } = await req.json();

    if (!content || !targetLocale) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Verify context/auth if necessary

    const completion = await lingo.localizeText(content, {
      targetLocale: targetLocale,
      sourceLocale: null, // Auto-detect source language
    });

    return NextResponse.json({ translatedContent: completion });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
