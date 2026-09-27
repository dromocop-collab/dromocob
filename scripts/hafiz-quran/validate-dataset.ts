import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { validateQuranDataset } from "../../lib/hafiz/quran-schema.ts";

const path = process.argv[2];
const checksumOnly = process.argv.includes("--checksum-only");
if (!path) {
  console.error("Kullanım: npm run quran:validate -- /tam/yol/dataset.json [--checksum-only]");
  process.exit(2);
}

const input = JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
const report = validateQuranDataset(input);
if (checksumOnly) {
  console.log(report.calculatedChecksum || "Checksum hesaplanamadı.");
  process.exit(report.calculatedChecksum ? 0 : 1);
}
console.log(JSON.stringify({
  valid: report.valid,
  errors: report.errors,
  warnings: report.warnings,
  calculatedChecksum: report.calculatedChecksum,
  stats: report.stats,
}, null, 2));
process.exit(report.valid ? 0 : 1);
