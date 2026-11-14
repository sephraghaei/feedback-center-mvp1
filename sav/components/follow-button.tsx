import { toggleBusinessFollow, toggleTopicFollow } from "@/app/actions";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "./icons";

export default function FollowButton({
  kind,
  id,
  following,
  authed,
  next,
  t,
}: {
  kind: "business" | "topic";
  id: string;
  following: boolean;
  authed: boolean;
  next: string;
  t: Dictionary;
}) {
  if (!authed) {
    return (
      <a href={`/sign-in?next=${encodeURIComponent(next)}`} className="btn btn-primary">
        <Icon name="plus" size={16} />
        {t.actionFollow}
      </a>
    );
  }

  return (
    <form action={kind === "business" ? toggleBusinessFollow : toggleTopicFollow}>
      <input type="hidden" name={kind === "business" ? "businessId" : "topicId"} value={id} />
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className={`btn ${following ? "btn-soft" : "btn-primary"}`}
        aria-pressed={following}
      >
        <Icon name={following ? "check" : "plus"} size={16} />
        {following ? t.actionFollowing : t.actionFollow}
      </button>
    </form>
  );
}
