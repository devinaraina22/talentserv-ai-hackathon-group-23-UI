import { NextRequest, NextResponse } from "next/server";
import { hasPermission } from "@/lib/auth";
import { createPatient, listPatients, logAudit } from "@/lib/db";
import { patientSchema } from "@/lib/validation";
import { requireProfile } from "@/lib/session";

export async function GET() {
  let profile;
  try {
    profile = await requireProfile();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(profile.role, "patients:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(listPatients());
}

export async function POST(request: NextRequest) {
  let profile;
  try {
    profile = await requireProfile();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(profile.role, "patients:write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const allowDuplicate = body.allow_duplicate === true;
    const patient = createPatient(parsed.data, { allowDuplicate });
    logAudit({
      user_id: profile.clerk_user_id,
      user_email: profile.email,
      user_role: profile.role,
      action: "CREATE",
      entity_type: "patient",
      entity_id: patient.patient_id,
      details: patient.full_name,
    });
    return NextResponse.json(patient, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create patient";
    const status = message.includes("Duplicate") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
