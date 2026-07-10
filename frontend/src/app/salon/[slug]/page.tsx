import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarCheck,
  Clock,
  Facebook,
  Globe,
  Home,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
// TODO: Replace server import with API call
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, salonJsonLd } from "@/lib/seo";
import { DAYS } from "@getsalons/shared/constants";
import { formatPKR, formatTime12h, truncate } from "@getsalons/shared/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton, ShareButton } from "@/components/salons/favorite-share";
import { CommentSection } from "@/components/salons/comment-section";
import { FaqAccordion } from "@/components/home/faq-accordion";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await getSalonPageData(slug);
    if (!data) return { title: "Salon not found" };
    const { salon } = data;
    return buildMetadata({
      title: `${salon.name} — ${salon.cityName} | Prices, Reviews & Online Booking`,
      description: truncate(
        `${salon.name} in ${salon.areaName ? `${salon.areaName}, ` : ""}${salon.cityName}. ${salon.description}`,
        160
      ),
      path: `/salon/${salon.slug}`,
      image: salon.coverImage,
    });
  } catch {
    return { title: "Salon" };
  }
}

const genderLabel = {
  men: "Men Only",
  women: "Women Only",
  unisex: "Unisex",
} as const;

export default async function SalonPage({ params }: Params) {
  const { slug } = await params;

  let data: Awaited<ReturnType<typeof getSalonPageData>> = null;
  try {
    data = await getSalonPageData(slug);
  } catch {
    data = null;
  }
  if (!data) notFound();

  const { salon, services, staff, reviews } = data;

  // Is this salon in the visitor's favourites?
  let favorited = false;
  const session = await auth();
  if (session?.user?.id) {
    try {
      await connectDB();
      const u = await User.findById(session.user.id).select("favorites");
      favorited =
        u?.favorites.some((f) => f.toString() === salon._id.toString()) ?? false;
    } catch {
      favorited = false;
    }
  }

  const todayHours = salon.openingHours.find(
    (h) => h.day === new Date().getDay()
  );
  const mapsUrl = salon.location?.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${salon.location.coordinates[1]},${salon.location.coordinates[0]}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name} ${salon.address} ${salon.cityName}`)}`;
  const whatsappUrl = salon.whatsapp
    ? `https://wa.me/${salon.whatsapp.replace(/[^\d]/g, "").replace(/^0/, "92")}?text=${encodeURIComponent(`Hi! I found ${salon.name} on GetSalons and would like to ask about booking.`)}`
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <JsonLd
        data={[
          salonJsonLd({
            name: salon.name,
            slug: salon.slug,
            description: salon.description,
            coverImage: salon.coverImage,
            address: salon.address,
            cityName: salon.cityName,
            phone: salon.phone,
            rating: salon.rating,
            priceRange: salon.priceRange,
            location: salon.location,
            openingHours: salon.openingHours.map((h) => ({
              day: h.day,
              open: h.open,
              close: h.close,
              isClosed: h.isClosed,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Salons", path: "/salons" },
            { name: salon.cityName, path: `/salons?city=${salon.cityName.toLowerCase()}` },
            { name: salon.name, path: `/salon/${salon.slug}` },
          ]),
          ...(salon.faqs && salon.faqs.length
            ? [
                faqJsonLd(
                  salon.faqs.map((f) => ({
                    question: String(f.question || ""),
                    answer: String(f.answer || ""),
                  }))
                ),
              ]
            : []),
        ]}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="py-4 text-xs text-fg-faint">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/salons" className="hover:text-gold">Salons</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg-muted">{salon.name}</span>
      </nav>

      {/* Hero */}
      <div className="relative h-64 overflow-hidden rounded-3xl sm:h-80 md:h-96">
        <Image
          src={salon.coverImage}
          alt={salon.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 sm:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {salon.isVerified && (
                <Badge variant="gold">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
              <Badge variant="neutral" className="border-white/20 bg-black/40 text-white">
                {genderLabel[salon.genderServed]}
              </Badge>
              {salon.homeService && (
                <Badge variant="neutral" className="border-white/20 bg-black/40 text-white">
                  <Home className="h-3 w-3" /> Home Service
                </Badge>
              )}
            </div>
            <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
              {salon.name}
            </h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              {salon.address}, {salon.areaName ? `${salon.areaName}, ` : ""}
              {salon.cityName}
            </p>
            <div className="mt-2">
              {salon.rating.count > 0 ? (
                <StarRating
                  value={salon.rating.average}
                  showValue
                  count={salon.rating.count}
                  className="[&_span]:!text-white"
                />
              ) : (
                <span className="text-xs text-white/70">New on GetSalons — no reviews yet</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <FavoriteButton salonId={salon._id.toString()} initialFavorited={favorited} />
            <ShareButton title={salon.name} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* ── Main column ─────────────────────────────── */}
        <div className="min-w-0 space-y-10">
          {/* About */}
          <section>
            <h2 className="font-display text-xl font-bold">About</h2>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              {salon.about || salon.description}
            </p>
          </section>

          {/* Services */}
          <section id="services">
            <h2 className="font-display text-xl font-bold">
              Services & Prices
            </h2>
            {services.length === 0 ? (
              <p className="mt-3 text-sm text-fg-muted">
                This salon hasn&apos;t listed services yet.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card">
                {services.map((service) => {
                  const hasDiscount =
                    service.discountPrice &&
                    service.discountPrice < service.price;
                  return (
                    <div
                      key={service._id.toString()}
                      className="flex items-center justify-between gap-4 p-4 sm:p-5"
                    >
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                          {service.name}
                          {service.isPopular && (
                            <Badge variant="gold">Popular</Badge>
                          )}
                        </p>
                        {service.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-fg-muted">
                            {service.description}
                          </p>
                        )}
                        <p className="mt-1 flex items-center gap-1 text-xs text-fg-faint">
                          <Clock className="h-3 w-3" /> {service.duration} min
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right">
                          {hasDiscount && (
                            <p className="text-xs text-fg-faint line-through">
                              {formatPKR(service.price)}
                            </p>
                          )}
                          <p className="text-sm font-bold text-gold">
                            {formatPKR(
                              hasDiscount
                                ? service.discountPrice!
                                : service.price
                            )}
                          </p>
                        </div>
                        <Link
                          href={`/book/${salon.slug}?service=${service._id.toString()}`}
                          className="rounded-xl bg-gold-500 px-4 py-2 text-xs font-semibold text-gold-950 transition-colors hover:bg-gold-400"
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Team */}
          {staff.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold">Meet the team</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {staff.map((member) => (
                  <div
                    key={member._id.toString()}
                    className="rounded-2xl border border-line bg-card p-4 text-center"
                  >
                    <span className="mx-auto block h-16 w-16 overflow-hidden rounded-full bg-gold-500/15">
                      {member.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg font-bold text-gold">
                          {member.name[0]}
                        </span>
                      )}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-fg">
                      {member.name}
                    </p>
                    {member.title && (
                      <p className="text-xs text-fg-faint">{member.title}</p>
                    )}
                    {member.rating.count > 0 && (
                      <div className="mt-1.5 flex justify-center">
                        <StarRating value={member.rating.average} size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {salon.gallery.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {salon.gallery.slice(0, 9).map((img, i) => (
                  <span
                    key={img.url}
                    className={`relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-square"}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.caption || `${salon.name} photo ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Reviews & Comments */}
          <CommentSection
            salonId={salon._id.toString()}
            salonName={salon.name}
            rating={salon.rating}
            currentUserId={session?.user?.id}
          />

          {/* FAQs */}
          {salon.faqs && salon.faqs.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold">FAQs</h2>
              <div className="mt-4">
                <FaqAccordion
                  faqs={salon.faqs.map((f) => ({
                    question: String(f.question || ""),
                    answer: String(f.answer || ""),
                  }))}
                />
              </div>
            </section>
          )}

          {/* Policies */}
          {(salon.policies?.cancellation || salon.policies?.notes) && (
            <section>
              <h2 className="font-display text-xl font-bold">Salon policies</h2>
              <div className="mt-4 space-y-3 rounded-2xl border border-line bg-card p-5 text-sm text-fg-muted">
                {salon.policies.cancellation && (
                  <p>
                    <span className="font-semibold text-fg">Cancellation: </span>
                    {salon.policies.cancellation}
                  </p>
                )}
                {salon.policies.notes && <p>{salon.policies.notes}</p>}
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-line bg-card p-5">
            <Link
              href={`/book/${salon.slug}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 py-3 text-sm font-bold text-gold-950 transition-colors hover:bg-gold-400"
            >
              <CalendarCheck className="h-4.5 w-4.5" /> Book Appointment
            </Link>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={`tel:${salon.phone}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-xs font-semibold text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600/40 bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              ) : (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-xs font-semibold text-fg-muted hover:border-gold-500/50 hover:text-gold"
                >
                  <MapPin className="h-3.5 w-3.5" /> Directions
                </a>
              )}
            </div>
          </div>

          {/* Hours */}
          <div className="rounded-2xl border border-line bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-gold" /> Opening hours
              {todayHours && !todayHours.isClosed && (
                <Badge variant="success">Open today</Badge>
              )}
            </h3>
            <ul className="mt-3 space-y-1.5">
              {[...salon.openingHours]
                .sort((a, b) => a.day - b.day)
                .map((h) => (
                  <li
                    key={h.day}
                    className={`flex justify-between text-xs ${h.day === new Date().getDay() ? "font-semibold text-fg" : "text-fg-muted"}`}
                  >
                    <span>{DAYS[h.day]}</span>
                    <span>
                      {h.isClosed
                        ? "Closed"
                        : `${formatTime12h(h.open)} – ${formatTime12h(h.close)}`}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-line bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-gold" /> Location
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">
              {salon.address}, {salon.areaName ? `${salon.areaName}, ` : ""}
              {salon.cityName}
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-xl border border-line py-2.5 text-center text-xs font-semibold text-gold transition-colors hover:border-gold-500/50"
            >
              Open in Google Maps →
            </a>
          </div>

          {/* Socials */}
          {(salon.socials?.instagram || salon.socials?.facebook || salon.website) && (
            <div className="flex items-center gap-2 rounded-2xl border border-line bg-card p-4">
              {salon.socials?.instagram && (
                <SocialLink href={salon.socials.instagram} label="Instagram">
                  <Instagram className="h-4 w-4" />
                </SocialLink>
              )}
              {salon.socials?.facebook && (
                <SocialLink href={salon.socials.facebook} label="Facebook">
                  <Facebook className="h-4 w-4" />
                </SocialLink>
              )}
              {salon.website && (
                <SocialLink href={salon.website} label="Website">
                  <Globe className="h-4 w-4" />
                </SocialLink>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-fg-muted transition-colors hover:border-gold-500/50 hover:text-gold"
    >
      {children}
    </a>
  );
}
