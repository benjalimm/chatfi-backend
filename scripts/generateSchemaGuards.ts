import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

const srcDir = fs.realpathSync('src/schema/');

// Get a list of all directories in the source directory
const dirs = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => path.join(srcDir, dirent.name));

// Output the list of directories
console.log('Generating type guards for the following directories:');
console.log(dirs);

// Generate type guards for all TypeScript files in the directories and their subdirectories
const cmd = `ts-auto-guard --export-all ${dirs
  .map((dir) => `"${dir}/**/*.ts"`)
  .join(' ')}`;
console.log('Running the following command:');
console.log(cmd);
child_process.execSync(cmd, { stdio: 'inherit' });
