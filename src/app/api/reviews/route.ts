import { NextResponse } from "next/server";
import { runAccountHealthReview } from "@/services/account-health";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return NextResponse.json(runAccountHealthReview(payload), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "REVIEW_REJECTED", message: error instanceof Error ? error.message : "The request could not be validated." },
      { status: 422 },
    );
  }
}
