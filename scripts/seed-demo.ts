/**
 * Seeds an English demo workspace for local development and visual checks.
 * Safe to run more than once: it only fills a company that has no feedback yet.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../lib/db";
import {
  changelogEntries,
  changelogPosts,
  comments,
  companies,
  companyMembers,
  posts,
  profiles,
  upvotes,
  users,
} from "../lib/db/schema";

try {
  process.loadEnvFile(".env");
} catch {
  // The environment may already come from the shell or CI.
}

const PEOPLE = [
  { email: "maya@example.com", name: "Maya Chen" },
  { email: "jonas@example.com", name: "Jonas Weber" },
  { email: "sara@example.com", name: "Sara Ahmadi" },
  { email: "leo@example.com", name: "Leo Park" },
  { email: "nadia@example.com", name: "Nadia Rossi" },
  { email: "tom@example.com", name: "Tom Baker" },
];

const DEMO_POSTS = [
  {
    title: "Export the feedback list to CSV",
    body: "We review feedback in a weekly spreadsheet with support and sales. A CSV export with title, votes, status, customer and date would save us a manual copy and paste session every Monday.",
    category: "improvement",
    status: "in_progress",
    daysAgo: 6,
    votes: 38,
    comments: [
      "This would also help our analysts. Please include the category column.",
      "Adding a date range filter to the export would make it even better.",
    ],
  },
  {
    title: "Dark mode flashes white on first paint",
    body: "On the web app, the page paints white for a moment before the dark theme loads. It is most noticeable on slower connections and when opening a link from Slack.",
    category: "bug",
    status: "new",
    daysAgo: 2,
    votes: 24,
    comments: ["Seeing the same flash on Safari.", "A loading background that follows the saved theme would fix it."],
  },
  {
    title: "Keyboard shortcuts for triage",
    body: "Let us move between feedback items and set a status without touching the mouse. J and K to move, P for planned, S for shipped would cover most of our triage sessions.",
    category: "improvement",
    status: "planned",
    daysAgo: 12,
    votes: 51,
    comments: ["Please add a shortcut sheet people can open with a question mark."],
  },
  {
    title: "Slack alerts for new feedback",
    body: "We live in Slack. A channel alert with the title, category and vote count as soon as feedback arrives would let us reply while the customer is still thinking about it.",
    category: "improvement",
    status: "planned",
    daysAgo: 18,
    votes: 33,
    comments: ["A daily digest option next to instant alerts, please."],
  },
  {
    title: "Notification digest instead of one email per vote",
    body: "Every vote on my submissions sends a separate email. A daily or weekly summary would be much easier to follow.",
    category: "improvement",
    status: "new",
    daysAgo: 1,
    votes: 12,
    comments: [],
  },
  {
    title: "Search returns results from archived boards",
    body: "Searching for a feature shows old posts from a board we archived last year. Archived boards should be excluded unless we explicitly include them.",
    category: "bug",
    status: "new",
    daysAgo: 4,
    votes: 9,
    comments: ["Same here, it makes search results noisy."],
  },
  {
    title: "The new roadmap view is great",
    body: "Moving items between columns and seeing the vote counts next to each card has made our planning meetings much shorter. Please keep the compact density.",
    category: "praise",
    status: "shipped",
    daysAgo: 25,
    votes: 67,
    comments: ["The compact density is the best part."],
  },
  {
    title: "Bulk edit status from the feedback list",
    body: "After a release we close a dozen related requests one by one. Selecting several items and setting them to shipped in one action would remove that busywork.",
    category: "improvement",
    status: "in_progress",
    daysAgo: 9,
    votes: 41,
    comments: ["Bulk hide would help with spam too."],
  },
  {
    title: "Mobile app: the timeline jumps when a comment loads",
    body: "On iOS the post timeline scrolls to the top for a moment while comments load, then returns to the comment anchor. It makes long threads hard to read.",
    category: "bug",
    status: "new",
    daysAgo: 3,
    votes: 18,
    comments: [],
  },
  {
    title: "Dark mode and a faster inbox",
    body: "Dark mode now covers the inbox, post pages and the changelog. The inbox also loads faster and keeps your scroll position when you reply.",
    category: "improvement",
    status: "shipped",
    daysAgo: 30,
    votes: 54,
    comments: ["Dark mode looks great.", "The scroll position fix is a quiet win."],
  },
];

async function main(): Promise<void> {
  const db = getDb();

  for (const person of PEOPLE) {
    await db.insert(users).values({ email: person.email }).onConflictDoNothing();
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, person.email))
      .limit(1);
    if (!row) continue;
    await db
      .insert(profiles)
      .values({ userId: row.id, name: person.name })
      .onConflictDoUpdate({ target: profiles.userId, set: { name: person.name } });
  }

  const people = await db
    .select({ id: users.id, name: profiles.name })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.email, PEOPLE[0].email))
    .limit(1);

  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.slug, "vasa"))
    .limit(1);

  if (!company) throw new Error("Run npm run seed:company first.");

  if (people[0]) {
    await db
      .insert(companyMembers)
      .values({ companyId: company.id, userId: people[0].id, role: "owner" })
      .onConflictDoNothing();
  }

  const existing = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.companyId, company.id))
    .limit(1);
  if (existing.length > 0) {
    console.log("Demo feedback already exists, leaving it untouched.");
    return;
  }

  const authors = await db
    .select({ id: users.id, name: profiles.name })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.email, PEOPLE[0].email));

  for (const person of PEOPLE.slice(1)) {
    const [row] = await db
      .select({ id: users.id, name: profiles.name })
      .from(users)
      .innerJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.email, person.email))
      .limit(1);
    if (row) authors.push(row);
  }

  for (let i = 0; i < 44; i++) {
    const email = `voter${i + 1}@demo.local`;
    await db.insert(users).values({ email }).onConflictDoNothing();
  }

  const allVoters = await db.select({ id: users.id }).from(users);
  const allPeople = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id));

  if (authors.length === 0) throw new Error("Demo authors were not created.");

  const createdIds: string[] = [];
  let index = 0;
  for (const demo of DEMO_POSTS) {
    const author = authors[index % authors.length];
    const created = new Date(Date.now() - demo.daysAgo * 24 * 60 * 60 * 1000);
    const [row] = await db
      .insert(posts)
      .values({
        authorId: author.id,
        companyId: company.id,
        type: "feedback",
        category: demo.category,
        product: "Vasa",
        productUrl: "https://vasa.app",
        title: demo.title,
        body: demo.body,
        status: demo.status,
        createdAt: created,
        updatedAt: created,
      })
      .returning({ id: posts.id });
    if (!row) continue;
    createdIds.push(row.id);

    const voteTarget = Math.min(demo.votes, allVoters.length);
    const startsAt = index % allVoters.length;
    for (let i = 0; i < voteTarget; i++) {
      const voter = allVoters[(startsAt + i) % allVoters.length];
      await db.insert(upvotes).values({ postId: row.id, userId: voter.id }).onConflictDoNothing();
    }

    let commentOffset = 0;
    for (const body of demo.comments) {
      const commenter = allPeople[(startsAt + 1 + commentOffset) % allPeople.length];
      await db.insert(comments).values({
        postId: row.id,
        authorId: commenter.id,
        body,
        createdAt: new Date(created.getTime() + (commentOffset + 1) * 60 * 60 * 1000),
      });
      commentOffset += 1;
    }

    index += 1;
  }

  const updates = [
    {
      title: "1.5.0 Dark mode everywhere",
      body: "Dark mode now follows you from the board to post pages, the inbox and the changelog.\n\n- Dark palette across every surface\n- Faster first paint when a theme is saved\n- Compact roadmap density kept on small screens",
      daysAgo: 5,
      link: createdIds[0],
    },
    {
      title: "1.4.9 Faster inbox and smarter search",
      body: "Replies no longer reset your scroll position and search now ignores archived boards by default.\n\n- Inbox keeps your place after replying\n- Archived boards hidden from search\n- Notification emails grouped by post",
      daysAgo: 21,
      link: createdIds[6],
    },
  ];

  for (const update of updates) {
    const [entry] = await db
      .insert(changelogEntries)
      .values({
        companyId: company.id,
        title: update.title,
        body: update.body,
        publishedAt: new Date(Date.now() - update.daysAgo * 24 * 60 * 60 * 1000),
      })
      .returning({ id: changelogEntries.id });
    if (entry && update.link) {
      await db
        .insert(changelogPosts)
        .values({ entryId: entry.id, postId: update.link })
        .onConflictDoNothing();
    }
  }

  console.log(`Seeded ${createdIds.length} demo feedback posts for company vasa.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
