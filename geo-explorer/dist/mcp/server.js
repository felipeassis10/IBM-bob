"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const index_1 = require("../commands/index");
const server = new mcp_js_1.McpServer({
    name: 'geo-explorer',
    version: '1.0.0',
});
// ── Shared error formatter ────────────────────────────────────────────────────
function errorResponse(err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
        content: [{ type: 'text', text: JSON.stringify({ ok: false, error: message }, null, 2) }],
        isError: true,
    };
}
// ── Tool: get_track ───────────────────────────────────────────────────────────
server.tool('get_track', 'Returns the list of modules for a given technology learning track.', {
    tech: zod_1.z
        .string()
        .min(1, 'tech must not be empty')
        .describe('Technology id (e.g. "nodejs", "python", "typescript", "rpa-python")'),
}, async ({ tech }) => {
    try {
        const modules = (0, index_1.getTrack)(tech);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ ok: true, tech: tech.trim(), modules }, null, 2),
                },
            ],
        };
    }
    catch (err) {
        return errorResponse(err);
    }
});
// ── Tool: get_challenge ───────────────────────────────────────────────────────
server.tool('get_challenge', 'Returns a coding challenge for a given technology and difficulty level.', {
    tech: zod_1.z
        .string()
        .min(1, 'tech must not be empty')
        .describe('Technology id (e.g. "nodejs", "python", "typescript", "rpa-python")'),
    level: zod_1.z
        .string()
        .min(1, 'level must not be empty')
        .describe('Difficulty level: "iniciante" or "intermediario"'),
}, async ({ tech, level }) => {
    try {
        const challenge = (0, index_1.getChallenge)(tech, level);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ ok: true, tech: tech.trim(), level: level.trim(), challenge }, null, 2),
                },
            ],
        };
    }
    catch (err) {
        return errorResponse(err);
    }
});
// ── Tool: generate_certificate ────────────────────────────────────────────────
server.tool('generate_certificate', 'Generates a professional ASCII-art certificate of completion for a user who finished a learning track.', {
    userName: zod_1.z
        .string()
        .min(1, 'userName must not be empty')
        .describe('Full name of the learner'),
    tech: zod_1.z
        .string()
        .min(1, 'tech must not be empty')
        .describe('Technology id of the completed track (e.g. "nodejs", "rpa-python")'),
}, async ({ userName, tech }) => {
    try {
        const result = (0, index_1.generateCertificate)(userName, tech);
        return {
            content: [
                {
                    type: 'text',
                    text: `${result.text}\n\nVerification code: ${result.code}`,
                },
            ],
        };
    }
    catch (err) {
        return errorResponse(err);
    }
});
// ── Tool: verify_certificate ──────────────────────────────────────────────────
server.tool('verify_certificate', 'Verifies whether a certificate code is valid and returns its details (owner, track, issue date).', {
    code: zod_1.z
        .string()
        .min(1, 'code must not be empty')
        .describe('Certificate verification code (e.g. "GEO-A8F9")'),
}, async ({ code }) => {
    try {
        const record = (0, index_1.verifyCertificate)(code);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ ok: true, valid: true, certificate: record }, null, 2),
                },
            ],
        };
    }
    catch (err) {
        return errorResponse(err);
    }
});
// ── Start server ──────────────────────────────────────────────────────────────
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('Geo-Explorer MCP server running on stdio');
}
main().catch((err) => {
    console.error('Fatal error starting MCP server:', err);
    process.exit(1);
});
