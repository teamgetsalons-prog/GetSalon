"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, AlertTriangle, Crown, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  _id: string;
  plan: string;
  status: string;
  trialStartDate?: string;
  trialEndDate?: string;
  startDate: string;
  expiryDate: string;
}

const plans = [
  {
    name: "Basic",
    slug: "basic",
    price: 500,
    features: [
      "Unlimited bookings",
      "Complete appointment management",
      "Staff management",
      "Service management",
      "Gallery management",
      "Customer reviews",
      "WhatsApp button",
      "Analytics dashboard",
      "Business profile customization",
      "SEO-friendly salon page",
      "Booking history",
      "Email notifications",
    ],
  },
  {
    name: "Premium",
    slug: "premium",
    price: 800,
    features: [
      "Everything in Basic",
      "Featured salon badge",
      "Priority placement in search results",
      "Homepage featured section eligibility",
      "Premium analytics",
      "Extra gallery capacity",
      "Promotional badge",
      "Priority customer support",
      "Future premium marketing tools",
    ],
    popular: true,
  },
];

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const res = await api<{ subscription: Subscription }>("/api/subscription");
      if (res.success && res.data) {
        setSubscription(res.data.subscription);
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(plan: "basic" | "premium") {
    try {
      setUpgrading(true);
      const res = await api<Subscription>("/api/subscription", {
        method: "POST",
        json: { plan },
      });
      if (res.success) {
        fetchSubscription();
      }
    } catch (error) {
      console.error("Failed to upgrade:", error);
    } finally {
      setUpgrading(false);
    }
  }

  function getDaysRemaining(): number {
    if (!subscription) return 0;
    const expiry = new Date(subscription.expiryDate);
    const now = new Date();
    return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  function getStatusColor(): "neutral" | "warning" | "gold" | "success" | "danger" {
    if (!subscription) return "neutral";
    if (subscription.status === "expired") return "danger";
    if (subscription.plan === "trial") return "warning";
    if (subscription.plan === "premium") return "gold";
    return "success";
  }

  function getStatusLabel() {
    if (!subscription) return "No Subscription";
    if (subscription.status === "expired") return "Expired";
    if (subscription.plan === "trial") return "Free Trial";
    if (subscription.plan === "premium") return "Active Premium";
    return "Active Basic";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Subscription</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Manage your subscription plan
        </p>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-line bg-card p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Current Plan</h2>
              <Badge variant={getStatusColor() as any}>{getStatusLabel()}</Badge>
            </div>
            {subscription && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-fg-muted">
                  <span className="font-medium text-fg">Plan:</span>{" "}
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </p>
                <p className="text-sm text-fg-muted">
                  <span className="font-medium text-fg">Expiry:</span>{" "}
                  {new Date(subscription.expiryDate).toLocaleDateString("en-PK")}
                </p>
                {subscription.plan === "trial" && (
                  <p className="text-sm text-fg-muted">
                    <span className="font-medium text-fg">Days Remaining:</span>{" "}
                    <span className="font-semibold text-gold">{getDaysRemaining()} days</span>
                  </p>
                )}
              </div>
            )}
          </div>
          {subscription?.plan === "trial" && (
            <div className="rounded-xl bg-gold-500/10 p-3">
              <Clock className="h-6 w-6 text-gold" />
            </div>
          )}
        </div>

        {subscription?.plan === "trial" && getDaysRemaining() <= 14 && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Trial expiring soon!
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  Your free trial expires in {getDaysRemaining()} days. Upgrade to a paid plan to
                  continue accepting bookings.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Plan Comparison */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Choose a Plan</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <motion.div
              key={plan.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`relative rounded-2xl border bg-card p-6 ${
                plan.popular
                  ? "border-gold shadow-lg shadow-gold/10"
                  : "border-line"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="gold">
                    <Crown className="h-3 w-3" /> Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gold">Rs {plan.price.toLocaleString()}</span>
                  <span className="text-sm text-fg-muted">/month</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="text-fg-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.slug as "basic" | "premium")}
                disabled={upgrading || subscription?.plan === plan.slug}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
                  subscription?.plan === plan.slug
                    ? "bg-bg-soft text-fg-faint cursor-not-allowed"
                    : plan.popular
                      ? "bg-gold-500 text-gold-950 hover:bg-gold-400"
                      : "border border-line text-fg hover:border-gold-500/50 hover:text-gold"
                }`}
              >
                {subscription?.plan === plan.slug ? (
                  "Current Plan"
                ) : upgrading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    {plan.popular ? <Zap className="h-4 w-4" /> : null}
                    {subscription?.plan === "trial" ? "Upgrade Now" : "Switch Plan"}
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Free Launch Notice */}
      <div className="rounded-2xl border border-line bg-card p-6 text-center">
        <p className="text-sm text-fg-muted">
          <span className="font-semibold text-gold">Free Launch:</span> All salons currently receive a 2-month free trial with full access to all features. Paid plans will be available soon.
        </p>
      </div>
    </div>
  );
}
