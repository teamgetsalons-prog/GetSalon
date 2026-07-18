import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
export function formatPKR(amount) {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
/** A service's price as a single amount, or "Rs 1,000 - Rs 1,500" when a
 * higher end (priceMax) is set - e.g. a haircut priced by hair length. */
export function formatPriceRange(price, priceMax) {
    if (priceMax && priceMax > price) {
        return `${formatPKR(price)} - ${formatPKR(priceMax)}`;
    }
    return formatPKR(price);
}
export function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}
export function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function formatTime12h(time) {
    if (!time)
        return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}
export function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
export function fromDateKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
}
export function formatDateKey(date) {
    if (typeof date === "string")
        return date;
    return toDateKey(date);
}
export function generateBookingNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${timestamp}-${random}`;
}
export function truncate(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - 3) + "...";
}
export function roundRating(rating, decimals = 1) {
    return Math.round(rating * 10 ** decimals) / 10 ** decimals;
}
/** "45" -> "45 min", "60" -> "1 hr", "90" -> "1 hr 30 min" */
export function formatDuration(minutes) {
    if (minutes < 60)
        return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}
export function absoluteUrl(path) {
    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
    return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
