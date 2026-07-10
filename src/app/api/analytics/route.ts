import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { connectDB } from "@/server/db";
import { Salon } from "@/server/models";
import { getSalonAnalytics } from "@/server/services/analytics.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get salon for this user
    const salon = await Salon.findOne({ owner: session.user.id });
    if (!salon) {
      return NextResponse.json(
        { success: false, message: "No salon found" },
        { status: 404 }
      );
    }

    const analytics = await getSalonAnalytics(salon._id.toString());

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
