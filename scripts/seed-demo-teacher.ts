/**
 * CLI wrapper around the shared demo seed.
 *
 * The seed itself lives in `src/db/seedDemoTeacher.ts` so local server startup
 * and this command produce exactly the same evaluator workspace.
 *
 * Usage: npx tsx scripts/seed-demo-teacher.ts
 */
import 'dotenv/config';
import { seedDemoTeacherData } from '../src/db/seedDemoTeacher';

seedDemoTeacherData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
