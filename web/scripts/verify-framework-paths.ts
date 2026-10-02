import { verifyAllPaths } from '../lib/verify-paths';

async function main() {
  const result = await verifyAllPaths();
  console.log('Repo root:', result.repoRoot);
  console.log('');
  for (const c of result.checks) {
    console.log(`${c.exists ? 'OK' : 'MISSING'}  [${c.role}] ${c.label}`);
    console.log(`       ${c.path}`);
  }
  console.log('');
  console.log(result.ok ? 'All paths verified.' : 'Some paths missing — run from web/ after clone.');
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
