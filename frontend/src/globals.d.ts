/* eslint-disable */
// Server-side stubs for pages that haven't been migrated to API calls yet.
// TODO: Replace each usage with a fetch to the backend API.
declare function connectDB(): Promise<void>;
declare function auth(): Promise<{ user: { id: string; name: string; email: string; role: string; salonId?: string } | null }>;
declare function getHomePageData(): Promise<any>;
declare function getSalonPageData(slug: string): Promise<any>;
declare function getActorSalon(actor: any): Promise<any>;
declare function searchSalons(input: any): Promise<any>;
declare function toSalonCard(salon: any): any;
declare const Salon: any;
declare const User: any;
declare const Appointment: any;
declare const Review: any;
declare const Service: any;
declare const Staff: any;
declare const BlogPost: any;
declare const City: any;
declare const Category: any;
declare const Area: any;
declare type ISalon = any;
declare const PLAN_FEATURES: any;

