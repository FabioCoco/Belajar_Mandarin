import { Users, ShoppingBag, BedDouble, Languages, Briefcase, Cake, Flower2, Star } from 'lucide-react';

// Ikon bab berputar mengikuti nomor bab, sama seperti warnanya (bab baru otomatis dapat ikon).
const ICONS = [Users, ShoppingBag, BedDouble, Languages, Briefcase, Cake, Flower2, Star];

export default function ChapterIcon({ bab, size = 22, className = '' }) {
  const Icon = ICONS[(Math.max(1, bab) - 1) % ICONS.length];
  return <Icon size={size} className={className} aria-hidden="true" />;
}
