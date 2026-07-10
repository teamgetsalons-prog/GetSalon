"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Calendar,
  CheckCircle,
  Phone,
  MessageCircle,
  Star,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPKR } from "@/lib/utils";

interface Analytics {
  profileViews: number;
  bookingRequests: number;
  completedBookings: number;
  phoneClicks: number;
  whatsappClicks: number;
  reviewCount: number;
  averageRating: number;
  revenue: number;
}

const stats = [
  { key: "profileViews", label: "Profile Views", icon: Eye, color: "text-blue-500" },
  { key: "bookingRequests", label: "Booking Requests", icon: Calendar, color: "text-amber-500" },
  { key: "completedBookings", label: "Completed Bookings", icon: CheckCircle, color: "text-green-500" },
  { key: "phoneClicks", label: "Phone Clicks", icon: Phone, color: "text-purple-500" },
  { key: "whatsappClicks", label: "WhatsApp Clicks", icon: MessageCircle, color: "text-emerald-500" },
  { key: "reviewCount", label: "Reviews", icon: Star, color: "text-gold" },
];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await api<Analytics>("/api/analytics");
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-20 text-center">
        <p className="text-fg-muted">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Track your salon&apos;s performance and customer engagement
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-line bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fg-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-fg">
                  {(analytics as any)[stat.key]?.toLocaleString("en-PK") || 0}
                </p>
              </div>
              <div className={`rounded-xl bg-bg-soft p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Rating */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-line bg-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-500/10 p-3">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-fg-muted">Total Revenue</p>
              <p className="text-2xl font-bold text-fg">{formatPKR(analytics.revenue)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border border-line bg-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gold/10 p-3">
              <Star className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-fg-muted">Average Rating</p>
              <p className="text-2xl font-bold text-fg">
                {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : "N/A"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Engagement Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl border border-line bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Engagement Summary</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">Profile Views</span>
              <span className="font-medium text-fg">{analytics.profileViews}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-soft">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${Math.min(100, (analytics.profileViews / Math.max(analytics.profileViews, 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">Booking Conversion</span>
              <span className="font-medium text-fg">
                {analytics.profileViews > 0
                  ? ((analytics.completedBookings / analytics.profileViews) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-soft">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${Math.min(100, analytics.profileViews > 0 ? (analytics.completedBookings / analytics.profileViews) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">Contact Rate</span>
              <span className="font-medium text-fg">
                {analytics.profileViews > 0
                  ? (
                      ((analytics.phoneClicks + analytics.whatsappClicks) /
                        analytics.profileViews) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-soft">
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `${Math.min(100, analytics.profileViews > 0 ? ((analytics.phoneClicks + analytics.whatsappClicks) / analytics.profileViews) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
