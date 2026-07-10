import { BookingList } from "@/components/dashboard/booking-list";

export default function CustomerBookingsPage() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">My bookings</h2>
      <BookingList role="customer" />
    </div>
  );
}
