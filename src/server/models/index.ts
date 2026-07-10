/**
 * Barrel export for all Mongoose models.
 * Importing from here guarantees every schema is registered before use
 * (important for populate() across models in serverless environments).
 */
export { User, type IUser } from "./User";
export { City, Area, type ICity, type IArea } from "./City";
export { Category, type ICategory } from "./Category";
export { Salon, type ISalon } from "./Salon";
export { Staff, type IStaff } from "./Staff";
export { Service, type IService } from "./Service";
export { Appointment, type IAppointment } from "./Appointment";
export { Review, type IReview } from "./Review";
export { Comment, type IComment } from "./Comment";
export {
  Subscription,
  PLAN_FEATURES,
  type ISubscription,
} from "./Subscription";
export {
  SubscriptionPlan,
  SalonSubscription,
  SubscriptionInvoice,
  SubscriptionPayment,
  SUBSCRIPTION_PLANS,
  type ISubscriptionPlan,
  type ISalonSubscription,
  type ISubscriptionInvoice,
  type ISubscriptionPayment,
  type SubscriptionPlanType,
  type SubscriptionStatus,
  type PaymentStatus,
} from "./SubscriptionNew";
export { Coupon, type ICoupon } from "./Coupon";
export { Notification, type INotification } from "./Notification";
export { BlogPost, type IBlogPost } from "./BlogPost";
export { AuditLog, type IAuditLog } from "./AuditLog";
export { Advertisement, type IAdvertisement } from "./Advertisement";
export { Setting, type ISetting } from "./Setting";
