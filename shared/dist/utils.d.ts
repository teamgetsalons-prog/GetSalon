import { type ClassValue } from "clsx";
export declare function cn(...inputs: ClassValue[]): string;
export declare function slugify(text: string): string;
export declare function formatPKR(amount: number): string;
export declare function timeToMinutes(time: string): number;
export declare function minutesToTime(minutes: number): string;
export declare function formatTime12h(time: string | undefined | null): string;
export declare function toDateKey(date: Date): string;
export declare function fromDateKey(key: string): Date;
export declare function formatDateKey(date: Date | string): string;
export declare function generateBookingNumber(): string;
export declare function truncate(text: string, maxLength: number): string;
export declare function roundRating(rating: number, decimals?: number): number;
/** "45" -> "45 min", "60" -> "1 hr", "90" -> "1 hr 30 min" */
export declare function formatDuration(minutes: number): string;
export declare function absoluteUrl(path: string): string;
