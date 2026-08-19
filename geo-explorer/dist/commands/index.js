"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrack = getTrack;
exports.getChallenge = getChallenge;
exports.generateCertificate = generateCertificate;
exports.verifyCertificate = verifyCertificate;
exports._getCertificateStore = _getCertificateStore;
const tracks_json_1 = __importDefault(require("../data/tracks.json"));
// ── Internal helpers ──────────────────────────────────────────────────────────
const allTracks = tracks_json_1.default;
/**
 * Normalises an arbitrary string input: trims whitespace and lowercases.
 * Used for all user-supplied ids and codes to make lookups resilient.
 */
function normalise(value) {
    return value.trim().toLowerCase();
}
/**
 * Guards against empty or whitespace-only string inputs.
 * Throws a descriptive error so callers always get a human-readable message.
 */
function requireNonEmpty(value, fieldName) {
    if (value.trim().length === 0) {
        throw new Error(`"${fieldName}" must not be empty.`);
    }
}
// ── In-memory certificate store ───────────────────────────────────────────────
const certificateStore = new Map();
/**
 * Generates a unique certificate code in the format GEO-XXXX
 * using random uppercase alphanumeric characters.
 */
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GEO-';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    // Ensure uniqueness — retry on the (astronomically unlikely) collision
    return certificateStore.has(code) ? generateCode() : code;
}
// ── Exported functions ────────────────────────────────────────────────────────
/**
 * Returns the modules of a learning track by technology id.
 *
 * @param tech - Technology id (e.g. "nodejs", "python", "typescript", "rpa-python").
 *               Leading/trailing spaces and mixed case are accepted.
 * @throws If `tech` is empty or the track is not found.
 */
function getTrack(tech) {
    requireNonEmpty(tech, 'tech');
    const normTech = normalise(tech);
    const track = allTracks.find((t) => t.id.toLowerCase() === normTech);
    if (!track) {
        throw new Error(`Track not found for technology: "${tech.trim()}". ` +
            `Available tracks: ${allTracks.map((t) => t.id).join(', ')}`);
    }
    return track.modules;
}
/**
 * Returns the challenge for the given technology and difficulty level.
 *
 * @param tech  - Technology id (e.g. "nodejs", "rpa-python"). Trimmed and lowercased.
 * @param level - Difficulty level ("iniciante" | "intermediario"). Trimmed and lowercased.
 * @throws If either argument is empty, the track is unknown, or the level does not exist.
 */
function getChallenge(tech, level) {
    requireNonEmpty(tech, 'tech');
    requireNonEmpty(level, 'level');
    const normTech = normalise(tech);
    const normLevel = normalise(level);
    const track = allTracks.find((t) => t.id.toLowerCase() === normTech);
    if (!track) {
        throw new Error(`Track not found for technology: "${tech.trim()}". ` +
            `Available tracks: ${allTracks.map((t) => t.id).join(', ')}`);
    }
    const challenge = track.challenges[normLevel];
    if (!challenge) {
        const availableLevels = Object.keys(track.challenges).join(', ');
        throw new Error(`Challenge level "${level.trim()}" not found for "${tech.trim()}". ` +
            `Available levels: ${availableLevels}`);
    }
    return challenge;
}
// ── ASCII-art certificate helpers ─────────────────────────────────────────────
/**
 * Builds a centered line padded to fit inside a box of `innerWidth` characters.
 * Content that exceeds `innerWidth` is rendered as-is (no truncation).
 */
function centerLine(content, innerWidth) {
    const pad = Math.max(0, innerWidth - content.length);
    const left = Math.floor(pad / 2);
    const right = pad - left;
    return `│ ${' '.repeat(left)}${content}${' '.repeat(right)} │`;
}
/**
 * Generates a professional ASCII-art certificate of completion and persists it
 * in memory with a unique verification code (e.g. GEO-A8F9).
 *
 * @param userName - Full name of the learner. Must not be empty.
 * @param tech     - Technology id of the completed track. Must not be empty.
 * @returns `{ text, code }` — the formatted certificate and its unique code.
 * @throws If `userName` or `tech` is empty, or if the track is not found.
 */
function generateCertificate(userName, tech) {
    requireNonEmpty(userName, 'userName');
    requireNonEmpty(tech, 'tech');
    const trimmedName = userName.trim();
    const normTech = normalise(tech);
    const track = allTracks.find((t) => t.id.toLowerCase() === normTech);
    if (!track) {
        throw new Error(`Track not found for technology: "${tech.trim()}". ` +
            `Available tracks: ${allTracks.map((t) => t.id).join(', ')}`);
    }
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const code = generateCode();
    // Persist record for later verification
    const record = {
        code,
        userName: trimmedName,
        tech: track.id,
        trackName: track.name,
        issuedAt: date,
    };
    certificateStore.set(code, record);
    // ── ASCII art box (inner width = 56 chars) ────────────────────────────────
    const W = 56;
    const top = `┌${'─'.repeat(W + 2)}┐`;
    const bottom = `└${'─'.repeat(W + 2)}┘`;
    const divider = `├${'─'.repeat(W + 2)}┤`;
    const blank = `│ ${' '.repeat(W)} │`;
    const moduleLabel = `${track.modules.length} module${track.modules.length !== 1 ? 's' : ''}`;
    const text = [
        top,
        centerLine('★  GEO-EXPLORER  ★', W),
        centerLine('CERTIFICATE OF COMPLETION', W),
        divider,
        blank,
        centerLine('This certifies that', W),
        blank,
        centerLine(trimmedName.toUpperCase(), W),
        blank,
        centerLine('has successfully completed the learning track:', W),
        blank,
        centerLine(track.name, W),
        centerLine(`(${moduleLabel})`, W),
        blank,
        divider,
        centerLine(`Issued on : ${date}`, W),
        centerLine(`Certificate code : ${code}`, W),
        bottom,
    ].join('\n');
    return { text, code };
}
/**
 * Verifies whether a certificate code is valid and returns its full record.
 *
 * @param code - Certificate code (e.g. "GEO-A8F9"). Trimmed and uppercased automatically.
 * @throws If `code` is empty or not found in the current session.
 */
function verifyCertificate(code) {
    requireNonEmpty(code, 'code');
    const normCode = code.trim().toUpperCase();
    const record = certificateStore.get(normCode);
    if (!record) {
        throw new Error(`Certificate code "${code.trim()}" not found. ` +
            `It may be invalid or was issued in a different session.`);
    }
    return record;
}
/**
 * Exposes the certificate store for testing purposes only.
 * @internal
 */
function _getCertificateStore() {
    return certificateStore;
}
