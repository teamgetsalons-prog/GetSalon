import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getLoyaltyData, redeemPoints } from "@/server/services/loyalty.service";
import { z } from "zod";

const redeemSchema = z.object({
  points: z.number().min(100, "Minimum 100 points required"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const loyaltyData = await getLoyaltyData(session.user.id);

    return NextResponse.json({
      success: true,
      data: loyaltyData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch loyalty data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = redeemSchema.parse(body);

    const result = await redeemPoints(session.user.id, validatedData.points);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Points redeemed successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to redeem points" },
      { status: 500 }
    );
  }
}
