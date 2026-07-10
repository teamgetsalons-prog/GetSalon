import { connectDB } from "../db.js";
import {
  LoyaltyAccount,
  LoyaltyTransaction,
  LOYALTY_RULES,
} from "../models/Loyalty.js";

/** Get or create loyalty account for a customer */
export async function getOrCreateLoyaltyAccount(customerId: string) {
  await connectDB();

  let account = await LoyaltyAccount.findOne({ customer: customerId });
  if (!account) {
    account = await LoyaltyAccount.create({
      customer: customerId,
      totalPoints: 0,
      earnedPoints: 0,
      redeemedPoints: 0,
      tier: "bronze",
    });
  }

  return account;
}

/** Earn points after a completed booking */
export async function earnPoints(
  customerId: string,
  amountSpent: number,
  appointmentId: string,
  salonId: string
) {
  await connectDB();

  const account = await getOrCreateLoyaltyAccount(customerId);

  // Calculate points with tier multiplier
  const basePoints = Math.floor(amountSpent * LOYALTY_RULES.pointsPerRupee);
  const multiplier =
    LOYALTY_RULES.tierMultipliers[account.tier as keyof typeof LOYALTY_RULES.tierMultipliers] || 1;
  const points = Math.floor(basePoints * multiplier);

  // Create transaction
  await LoyaltyTransaction.create({
    account: account._id,
    customer: customerId,
    type: "earned",
    points,
    description: `Earned ${points} points from booking`,
    appointment: appointmentId,
    salon: salonId,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
  });

  // Update account
  account.totalPoints += points;
  account.earnedPoints += points;

  // Update tier
  if (account.totalPoints >= LOYALTY_RULES.tierThresholds.platinum) {
    account.tier = "platinum";
  } else if (account.totalPoints >= LOYALTY_RULES.tierThresholds.gold) {
    account.tier = "gold";
  } else if (account.totalPoints >= LOYALTY_RULES.tierThresholds.silver) {
    account.tier = "silver";
  }

  await account.save();

  return { points, totalPoints: account.totalPoints, tier: account.tier };
}

/** Redeem points for a discount */
export async function redeemPoints(
  customerId: string,
  pointsToRedeem: number
) {
  await connectDB();

  const account = await getOrCreateLoyaltyAccount(customerId);

  if (pointsToRedeem < LOYALTY_RULES.minPointsForRedemption) {
    throw new Error(
      `Minimum ${LOYALTY_RULES.minPointsForRedemption} points required for redemption`
    );
  }

  if (account.totalPoints < pointsToRedeem) {
    throw new Error("Insufficient points");
  }

  const discountValue = pointsToRedeem * LOYALTY_RULES.redemptionValue;

  // Create transaction
  await LoyaltyTransaction.create({
    account: account._id,
    customer: customerId,
    type: "redeemed",
    points: pointsToRedeem,
    description: `Redeemed ${pointsToRedeem} points for Rs. ${discountValue} discount`,
  });

  // Update account
  account.totalPoints -= pointsToRedeem;
  account.redeemedPoints += pointsToRedeem;
  await account.save();

  return { discountValue, remainingPoints: account.totalPoints };
}

/** Get loyalty account with history */
export async function getLoyaltyData(customerId: string) {
  await connectDB();

  const account = await getOrCreateLoyaltyAccount(customerId);

  const transactions = await LoyaltyTransaction.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .limit(20);

  const nextTier =
    account.tier === "platinum"
      ? null
      : account.tier === "gold"
        ? "platinum"
        : account.tier === "silver"
          ? "gold"
          : "silver";

  const pointsToNextTier = nextTier
    ? LOYALTY_RULES.tierThresholds[nextTier as keyof typeof LOYALTY_RULES.tierThresholds] -
      account.totalPoints
    : 0;

  return {
    account,
    transactions,
    nextTier,
    pointsToNextTier: Math.max(0, pointsToNextTier),
    redemptionValue: LOYALTY_RULES.redemptionValue,
  };
}
