/** Instant paint while the dashboard's server data loads - without this,
 *  slow backend responses leave the previous page frozen mid-navigation. */
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="skeleton mb-2 h-4 w-28" />
      <div className="skeleton mb-5 h-8 w-48" />
      <div className="mb-5 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="skeleton mb-4 h-24 w-full rounded-2xl" />
      <div className="skeleton h-64 w-full rounded-2xl" />
    </div>
  );
}
