import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  getTrack,
  getChallenge,
  generateCertificate,
  verifyCertificate,
} from '../commands/index';
import type { CertificateRecord, CertificateResult } from '../types';

const server = new McpServer({
  name: 'geo-explorer',
  version: '1.0.0',
});

// ── Shared error formatter ────────────────────────────────────────────────────

function errorResponse(err: unknown): { content: [{ type: 'text'; text: string }]; isError: true } {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ ok: false, error: message }, null, 2) }],
    isError: true,
  };
}

// ── Tool: get_track ───────────────────────────────────────────────────────────
server.tool(
  'get_track',
  'Returns the list of modules for a given technology learning track.',
  {
    tech: z
      .string()
      .min(1, 'tech must not be empty')
      .describe('Technology id (e.g. "nodejs", "python", "typescript", "rpa-python")'),
  },
  async ({ tech }): Promise<{ content: [{ type: 'text'; text: string }] }> => {
    try {
      const modules = getTrack(tech);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ ok: true, tech: tech.trim(), modules }, null, 2),
          },
        ],
      };
    } catch (err) {
      return errorResponse(err);
    }
  }
);

// ── Tool: get_challenge ───────────────────────────────────────────────────────
server.tool(
  'get_challenge',
  'Returns a coding challenge for a given technology and difficulty level.',
  {
    tech: z
      .string()
      .min(1, 'tech must not be empty')
      .describe('Technology id (e.g. "nodejs", "python", "typescript", "rpa-python")'),
    level: z
      .string()
      .min(1, 'level must not be empty')
      .describe('Difficulty level: "iniciante" or "intermediario"'),
  },
  async ({ tech, level }): Promise<{ content: [{ type: 'text'; text: string }] }> => {
    try {
      const challenge = getChallenge(tech, level);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              { ok: true, tech: tech.trim(), level: level.trim(), challenge },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return errorResponse(err);
    }
  }
);

// ── Tool: generate_certificate ────────────────────────────────────────────────
server.tool(
  'generate_certificate',
  'Generates a professional ASCII-art certificate of completion for a user who finished a learning track.',
  {
    userName: z
      .string()
      .min(1, 'userName must not be empty')
      .describe('Full name of the learner'),
    tech: z
      .string()
      .min(1, 'tech must not be empty')
      .describe('Technology id of the completed track (e.g. "nodejs", "rpa-python")'),
  },
  async ({ userName, tech }): Promise<{ content: [{ type: 'text'; text: string }] }> => {
    try {
      const result: CertificateResult = generateCertificate(userName, tech);
      return {
        content: [
          {
            type: 'text' as const,
            text: `${result.text}\n\nVerification code: ${result.code}`,
          },
        ],
      };
    } catch (err) {
      return errorResponse(err);
    }
  }
);

// ── Tool: verify_certificate ──────────────────────────────────────────────────
server.tool(
  'verify_certificate',
  'Verifies whether a certificate code is valid and returns its details (owner, track, issue date).',
  {
    code: z
      .string()
      .min(1, 'code must not be empty')
      .describe('Certificate verification code (e.g. "GEO-A8F9")'),
  },
  async ({ code }): Promise<{ content: [{ type: 'text'; text: string }] }> => {
    try {
      const record: CertificateRecord = verifyCertificate(code);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ ok: true, valid: true, certificate: record }, null, 2),
          },
        ],
      };
    } catch (err) {
      return errorResponse(err);
    }
  }
);

// ── Start server ──────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Geo-Explorer MCP server running on stdio');
}

main().catch((err: unknown) => {
  console.error('Fatal error starting MCP server:', err);
  process.exit(1);
});
