"use strict";
/**
 * Geo-Explorer Interactive CLI
 *
 * Run with:  npm run cli
 *
 * Provides an interactive terminal menu to explore learning tracks,
 * get coding challenges, generate certificates, and verify them.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const index_1 = require("./commands/index");
// ── Helpers ───────────────────────────────────────────────────────────────────
const TRACKS = [
    { name: 'Node.js', value: 'nodejs' },
    { name: 'Python', value: 'python' },
    { name: 'TypeScript', value: 'typescript' },
    { name: 'RPA com Python e SQL', value: 'rpa-python' },
];
const LEVELS = [
    { name: '🟢  Iniciante', value: 'iniciante' },
    { name: '🟡  Intermediário', value: 'intermediario' },
];
function banner() {
    console.clear();
    console.log(chalk_1.default.cyan.bold('╔══════════════════════════════════════════════════════╗'));
    console.log(chalk_1.default.cyan.bold('║') + chalk_1.default.yellow.bold('          🌍  GEO-EXPLORER  —  Learning Hub          ') + chalk_1.default.cyan.bold('║'));
    console.log(chalk_1.default.cyan.bold('╚══════════════════════════════════════════════════════╝'));
    console.log();
}
function separator() {
    console.log(chalk_1.default.gray('─'.repeat(58)));
}
function printSection(title) {
    separator();
    console.log(chalk_1.default.cyan.bold(`  ${title}`));
    separator();
}
// ── Menu handlers ─────────────────────────────────────────────────────────────
async function handleViewTrack() {
    const { tech } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'tech',
            message: 'Which learning track do you want to see?',
            choices: TRACKS,
        },
    ]);
    printSection(`📚  ${TRACKS.find((t) => t.value === tech)?.name} — Modules`);
    const modules = (0, index_1.getTrack)(tech);
    modules.forEach((m, i) => {
        console.log(chalk_1.default.green(`  ${String(i + 1).padStart(2, '0')}.`) + chalk_1.default.white(` ${m}`));
    });
    console.log();
}
async function handleGetChallenge() {
    const answers = await inquirer_1.default.prompt([
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
    const challenge = (0, index_1.getChallenge)(answers.tech, answers.level);
    console.log(chalk_1.default.yellow.bold(`  ${challenge.title}`));
    console.log();
    console.log(chalk_1.default.white(wrapText(challenge.description, 56, '  ')));
    console.log();
}
async function handleGenerateCertificate() {
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'userName',
            message: 'Enter your full name:',
            validate: (v) => v.trim().length > 0 || 'Name cannot be empty.',
        },
        {
            type: 'list',
            name: 'tech',
            message: 'Which track did you complete?',
            choices: TRACKS,
        },
    ]);
    const { text, code } = (0, index_1.generateCertificate)(answers.userName.trim(), answers.tech);
    console.log();
    // Print each line of the box with colour
    text.split('\n').forEach((line) => {
        if (line.startsWith('┌') || line.startsWith('└') || line.startsWith('├')) {
            console.log(chalk_1.default.cyan(line));
        }
        else if (line.includes('GEO-EXPLORER') || line.includes('CERTIFICATE')) {
            console.log(chalk_1.default.yellow.bold(line));
        }
        else if (line.includes('Certificate code')) {
            console.log(chalk_1.default.green.bold(line));
        }
        else {
            console.log(chalk_1.default.white(line));
        }
    });
    console.log();
    console.log(chalk_1.default.gray('  Save your code: ') + chalk_1.default.green.bold(code));
    console.log();
}
async function handleVerifyCertificate() {
    const { code } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'code',
            message: 'Enter certificate code (e.g. GEO-A8F9):',
            validate: (v) => v.trim().length > 0 || 'Code cannot be empty.',
        },
    ]);
    printSection(`🔐  Certificate Verification`);
    try {
        const record = (0, index_1.verifyCertificate)(code.trim());
        console.log(chalk_1.default.green.bold('  ✔  VALID CERTIFICATE'));
        console.log();
        console.log(chalk_1.default.gray('  Code      : ') + chalk_1.default.white(record.code));
        console.log(chalk_1.default.gray('  Holder    : ') + chalk_1.default.white(record.userName));
        console.log(chalk_1.default.gray('  Track     : ') + chalk_1.default.white(record.trackName));
        console.log(chalk_1.default.gray('  Tech ID   : ') + chalk_1.default.white(record.tech));
        console.log(chalk_1.default.gray('  Issued on : ') + chalk_1.default.white(record.issuedAt));
    }
    catch {
        console.log(chalk_1.default.red.bold('  ✖  INVALID OR UNRECOGNISED CODE'));
        console.log(chalk_1.default.gray(`  Code "${code.trim()}" was not found in this session.`));
    }
    console.log();
}
// ── Word wrap utility ─────────────────────────────────────────────────────────
function wrapText(text, maxWidth, indent = '') {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
        if ((current + (current ? ' ' : '') + word).length > maxWidth) {
            if (current)
                lines.push(indent + current);
            current = word;
        }
        else {
            current = current ? `${current} ${word}` : word;
        }
    }
    if (current)
        lines.push(indent + current);
    return lines.join('\n');
}
// ── Main loop ─────────────────────────────────────────────────────────────────
const MENU_CHOICES = [
    { name: '📚  View learning track modules', value: 'track' },
    { name: '⚡  Get a coding challenge', value: 'challenge' },
    { name: '🎓  Generate a certificate', value: 'certificate' },
    { name: '🔐  Verify a certificate code', value: 'verify' },
    { name: '🚪  Exit', value: 'exit' },
];
async function main() {
    banner();
    let running = true;
    while (running) {
        const { action } = await inquirer_1.default.prompt([
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
                console.log(chalk_1.default.yellow('  Thanks for using Geo-Explorer. Keep learning! 🚀'));
                console.log();
                break;
        }
        if (running) {
            await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: '_',
                    message: chalk_1.default.gray('Press ENTER to return to the main menu…'),
                },
            ]);
            banner();
        }
    }
}
main().catch((err) => {
    console.error(chalk_1.default.red('Fatal error:'), err);
    process.exit(1);
});
