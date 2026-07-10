import {
  Brush,
  Flower2,
  Footprints,
  Gem,
  Hand,
  Heart,
  Palette,
  Scissors,
  Sparkles,
  SprayCan,
  Sun,
  Waves,
  type LucideIcon,
} from "lucide-react";

/**
 * Categories store a lucide icon name (string) in the DB;
 * this map turns it into the actual icon component.
 */
const icons: Record<string, LucideIcon> = {
  scissors: Scissors,
  sparkles: Sparkles,
  brush: Brush,
  palette: Palette,
  flower: Flower2,
  hand: Hand,
  footprints: Footprints,
  gem: Gem,
  heart: Heart,
  spray: SprayCan,
  sun: Sun,
  waves: Waves,
};

export function CategoryIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Icon = (name && icons[name]) || Sparkles;
  return <Icon className={className} aria-hidden />;
}
