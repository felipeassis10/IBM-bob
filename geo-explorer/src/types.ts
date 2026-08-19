/**
 * Geo-Explorer — Shared TypeScript Interfaces
 *
 * This file is the single source of truth for every domain type used across
 * commands, the MCP server, the CLI, and the test suite.
 */

// ── Data-layer types ──────────────────────────────────────────────────────────

/** A single coding challenge with a title and a prose description. */
export interface Challenge {
  title: string;
  description: string;
}

/** A learning track as stored in tracks.json. */
export interface Track {
  id: string;
  name: string;
  modules: string[];
  challenges: Record<string, Challenge>;
}

// ── Certificate types ─────────────────────────────────────────────────────────

/** The in-memory record created every time a certificate is issued. */
export interface CertificateRecord {
  code: string;
  userName: string;
  tech: string;
  trackName: string;
  issuedAt: string;
}

/** Return value of generateCertificate(). */
export interface CertificateResult {
  /** The full ASCII-art certificate text, ready to print. */
  text: string;
  /** The unique verification code embedded in the certificate (e.g. "GEO-A8F9"). */
  code: string;
}
