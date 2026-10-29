/**
 * Migration entry point.
 *
 * Runs from `npm run deploy` (and from CI) before the build. Never at startup.
 * The project has no database schema yet, so this is a no-op for now.
 */
async function main(): Promise<void> {
  console.log("No migrations to run.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
