import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { upsertHealthIntake } from "@/lib/db";
import { healthIntakeSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = healthIntakeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const health = upsertHealthIntake(parsed.data);
    return NextResponse.json(health);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save health intake";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
