import type { Dictionary, Locale } from "@/lib/i18n";
import type { AnnouncementCardData } from "@/lib/types";
import AnnouncementCard from "./announcement-card";

export default function FeedGrid({
  cards,
  locale,
  t,
  saved,
  authed,
  next,
  showBusiness = true,
}: {
  cards: AnnouncementCardData[];
  locale: Locale;
  t: Dictionary;
  saved: Set<string>;
  authed: boolean;
  next: string;
  showBusiness?: boolean;
}) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <AnnouncementCard
          key={card.id}
          card={card}
          locale={locale}
          t={t}
          saved={saved.has(card.id)}
          authed={authed}
          next={next}
          showBusiness={showBusiness}
        />
      ))}
    </div>
  );
}
