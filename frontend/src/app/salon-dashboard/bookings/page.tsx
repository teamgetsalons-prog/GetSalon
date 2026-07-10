import { BookingList } from "@/components/dashboard/booking-list";

export default function SalonBookingsPage() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Bookings</h2>
      <BookingList role="salon" />
    </div>
  );
}
