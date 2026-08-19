/**
 * Geo-Explorer Interactive CLI
 *
 * Run with:  npm run cli
 *
 * Provides an interactive terminal menu to explore learning tracks,
 * get coding challenges, generate certificates, and verify them.
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  getTrack,
  getChallenge,
  generateCertificate,
  verifyCertificate,
} from './commands/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TRACKS = [
  { name: 'Node.js',              value: 'nodejs' },
  { name: 'Python',               value: 'python' },
  { name: 'TypeScript',           value: 'typescript' },
  { name: 'RPA com Python e SQL', value: 'rpa-python' },
];

const LEVELS = [
  { name: '🟢  Iniciante',      value: 'iniciante' },
  { name: '🟡  Intermediário',  value: 'intermediario' },
];

function banner(): void {
  console.clear();
  console.log(chalk.cyan.bold('╔══════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║') + chalk.yellow.bold('          🌍  GEO-EXPLORER  —  Learning Hub          ') + chalk.cyan.bold('║'));
  console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════╝'));
  console.log();
}

function separator(): void {
  console.log(chalk.gray('─'.repeat(58)));
}

function printSection(title: string): void {
  separator();
  console.log(chalk.cyan.bold(`  ${title}`));
  separator();
}

// ── Menu handlers ─────────────────────────────────────────────────────────────

async function handleViewTrack(): Promise<void> {
  const { tech } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tech',
      message: 'Which learning track do you want to see?',
      choices: TRACKS,
    },
  ]);

  printSection(`📚  ${TRACKS.find((t) => t.value === tech)?.name} — Modules`);
  const modules = getTrack(tech);
  modules.forEach((m, i) => {
    console.log(chalk.green(`  ${String(i + 1).padStart(2, '0')}.`) + chalk.white(` ${m}`));
  });
  console.log();
}

async function handleGetChallenge(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'tech',
      message: 'Choose a technology:',
      choices: TRACKS,
    },
    {
      type: 'list',
      name: 'level',
      message: 'Choose a difficulty level:',
      choices: LEVELS,
    },
  ]);

  printSection(`⚡  Challenge — ${answers.tech} / ${answers.level}`);
  const challenge = getChallenge(answers.tech, answers.level);
  console.log(chalk.yellow.bold(`  ${challenge.title}`));
  console.log();
  console.log(chalk.white(wrapText(challenge.description, 56, '  ')));
  console.log();
}

async function handleGenerateCertificate(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'userName',
      message: 'Enter your full name:',
      validate: (v: string) => v.trim().length > 0 || 'Name cannot be empty.',
    },
    {
      type: 'list',
      name: 'tech',
      message: 'Which track did you complete?',
      choices: TRACKS,
    },
  ]);

  const { text, code } = generateCertificate(answers.userName.trim(), answers.tech);

  console.log();
  // Print each line of the box with colour
  text.split('\n').forEach((line) => {
    if (line.startsWith('┌') || line.startsWith('└') || line.startsWith('├')) {
      console.log(chalk.cyan(line));
    } else if (line.includes('GEO-EXPLORER') || line.includes('CERTIFICATE')) {
      console.log(chalk.yellow.bold(line));
    } else if (line.includes('Certificate code')) {
      console.log(chalk.green.bold(line));
    } else {
      console.log(chalk.white(line));
    }
  });

  console.log();
  console.log(
    chalk.gray('  Save your code: ') + chalk.green.bold(code)
  );
  console.log();
}

async function handleVerifyCertificate(): Promise<void> {
  const { code } = await inquirer.prompt([
    {
      type: 'input',
      name: 'code',
      message: 'Enter certificate code (e.g. GEO-A8F9):',
      validate: (v: string) => v.trim().length > 0 || 'Code cannot be empty.',
    },
  ]);

  printSection(`🔐  Certificate Verification`);

  try {
    const record = verifyCertificate(code.trim());
    console.log(chalk.green.bold('  ✔  VALID CERTIFICATE'));
    console.log();
    console.log(chalk.gray('  Code      : ') + chalk.white(record.code));
    console.log(chalk.gray('  Holder    : ') + chalk.white(record.userName));
    console.log(chalk.gray('  Track     : ') + chalk.white(record.trackName));
    console.log(chalk.gray('  Tech ID   : ') + chalk.white(record.tech));
    console.log(chalk.gray('  Issued on : ') + chalk.white(record.issuedAt));
  } catch {
    console.log(chalk.red.bold('  ✖  INVALID OR UNRECOGNISED CODE'));
    console.log(chalk.gray(`  Code "${code.trim()}" was not found in this session.`));
  }

  console.log();
}

// ── Word wrap utility ─────────────────────────────────────────────────────────

function wrapText(text: string, maxWidth: number, indent = ''): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + (current ? ' ' : '') + word).length > maxWidth) {
      if (current) lines.push(indent + current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(indent + current);

  return lines.join('\n');
}

// ── Main loop ─────────────────────────────────────────────────────────────────

const MENU_CHOICES = [
  { name: '📚  View learning track modules',   value: 'track' },
  { name: '⚡  Get a coding challenge',         value: 'challenge' },
  { name: '🎓  Generate a certificate',         value: 'certificate' },
  { name: '🔐  Verify a certificate code',      value: 'verify' },
  { name: '🚪  Exit',                           value: 'exit' },
];

async function main(): Promise<void> {
  banner();

  let running = true;
  while (running) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: MENU_CHOICES,
        pageSize: 10,
      },
    ]);

    console.log();

    switch (action) {
      case 'track':
        await handleViewTrack();
        break;
      case 'challenge':
        await handleGetChallenge();
        break;
      case 'certificate':
        await handleGenerateCertificate();
        break;
      case 'verify':
        await handleVerifyCertificate();
        break;
      case 'exit':
        running = false;
        banner();
        console.log(chalk.yellow('  Thanks for using Geo-Explorer. Keep learning! 🚀'));
        console.log();
        break;
    }

    if (running) {
      await inquirer.prompt([
        {
          type: 'input',
          name: '_',
          message: chalk.gray('Press ENTER to return to the main menu…'),
        },
      ]);
      banner();
    }
  }
}

main().catch((err) => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
