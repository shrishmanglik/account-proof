import { NextResponse } from "next/server";
import { recordHumanDecision } from "@/services/human-decision";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return NextResponse.json(recordHumanDecision(payload), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "DECISION_REJECTED", message: error instanceof Error ? error.message : "The decision could not be recorded." },
      { status: 409 },
    );
  }
}
