import {
  getTrack,
  getChallenge,
  generateCertificate,
  verifyCertificate,
  _getCertificateStore,
} from '../src/commands/index';
import type { CertificateRecord, CertificateResult } from '../src/types';

beforeEach(() => {
  // Clear the in-memory store before each test to avoid cross-test contamination
  _getCertificateStore().clear();
});

// ── getTrack ──────────────────────────────────────────────────────────────────
describe('getTrack()', () => {
  // Valid inputs
  it('returns an array of modules for a valid technology', () => {
    const modules = getTrack('nodejs');
    expect(Array.isArray(modules)).toBe(true);
    expect(modules.length).toBeGreaterThan(0);
  });

  it('returns modules for "python" track', () => {
    const modules = getTrack('python');
    expect(modules).toContain('Python syntax and data types');
  });

  it('returns exactly the declared modules for the "typescript" track', () => {
    const modules = getTrack('typescript');
    expect(modules).toContain('TypeScript fundamentals and type system');
    expect(modules).toContain('Building type-safe APIs');
    expect(modules).toHaveLength(6);
  });

  it('returns modules for the "rpa-python" track', () => {
    const modules = getTrack('rpa-python');
    expect(Array.isArray(modules)).toBe(true);
    expect(modules).toContain('Web Scraping com BeautifulSoup e Selenium');
    expect(modules).toContain('Manipulação e transformação de dados com Pandas');
    expect(modules).toContain('Consumo de APIs REST com requests e autenticação OAuth2');
  });

  it('returns 7 modules for the "rpa-python" track', () => {
    expect(getTrack('rpa-python')).toHaveLength(7);
  });

  // Case-insensitivity & whitespace trimming
  it('is case-insensitive (accepts "NodeJS", "PYTHON", "TypeScript")', () => {
    expect(() => getTrack('NodeJS')).not.toThrow();
    expect(() => getTrack('PYTHON')).not.toThrow();
    expect(() => getTrack('TypeScript')).not.toThrow();
  });

  it('is case-insensitive for "RPA-PYTHON"', () => {
    expect(() => getTrack('RPA-PYTHON')).not.toThrow();
    expect(getTrack('RPA-Python').length).toBeGreaterThan(0);
  });

  it('trims leading/trailing whitespace from tech', () => {
    expect(() => getTrack('  nodejs  ')).not.toThrow();
    expect(getTrack('  nodejs  ')).toContain('Introduction to Node.js and the Event Loop');
  });

  // Invalid inputs
  it('throws for an unknown technology', () => {
    expect(() => getTrack('cobol')).toThrow('Track not found for technology: "cobol"');
  });

  it('throws for an empty string', () => {
    expect(() => getTrack('')).toThrow('"tech" must not be empty');
  });

  it('throws for a whitespace-only string', () => {
    expect(() => getTrack('   ')).toThrow('"tech" must not be empty');
  });
});

// ── getChallenge ──────────────────────────────────────────────────────────────
describe('getChallenge()', () => {
  // Valid inputs
  it('returns a challenge object with title and description', () => {
    const challenge = getChallenge('nodejs', 'iniciante');
    expect(challenge).toHaveProperty('title');
    expect(challenge).toHaveProperty('description');
    expect(typeof challenge.title).toBe('string');
    expect(typeof challenge.description).toBe('string');
  });

  it('returns the correct challenge for python/intermediario', () => {
    expect(getChallenge('python', 'intermediario').title).toBe('CSV Data Analyser');
  });

  it('returns the correct challenge for typescript/iniciante', () => {
    expect(getChallenge('typescript', 'iniciante').title).toBe('Typed Calculator');
  });

  it('returns the iniciante challenge for "rpa-python"', () => {
    const challenge = getChallenge('rpa-python', 'iniciante');
    expect(challenge.title).toBe('Raspador de Notícias');
    expect(challenge.description).toContain('BeautifulSoup');
  });

  it('returns the intermediario challenge for "rpa-python"', () => {
    const challenge = getChallenge('rpa-python', 'intermediario');
    expect(challenge.title).toBe('Pipeline de Dados com API + SQL');
    expect(challenge.description).toContain('SQLite');
  });

  // Case-insensitivity & whitespace trimming
  it('trims and lowercases tech and level', () => {
    expect(() => getChallenge('  NodeJS  ', '  INICIANTE  ')).not.toThrow();
    const ch = getChallenge('  NodeJS  ', '  INICIANTE  ');
    expect(ch.title).toBe('Hello, World! API');
  });

  // Invalid inputs
  it('throws for an invalid level', () => {
    expect(() => getChallenge('nodejs', 'avancado')).toThrow(
      'Challenge level "avancado" not found'
    );
  });

  it('throws for an unknown technology', () => {
    expect(() => getChallenge('ruby', 'iniciante')).toThrow(
      'Track not found for technology: "ruby"'
    );
  });

  it('throws for an empty tech', () => {
    expect(() => getChallenge('', 'iniciante')).toThrow('"tech" must not be empty');
  });

  it('throws for a whitespace-only tech', () => {
    expect(() => getChallenge('   ', 'iniciante')).toThrow('"tech" must not be empty');
  });

  it('throws for an empty level', () => {
    expect(() => getChallenge('nodejs', '')).toThrow('"level" must not be empty');
  });

  it('throws for a whitespace-only level', () => {
    expect(() => getChallenge('nodejs', '   ')).toThrow('"level" must not be empty');
  });
});

// ── generateCertificate ───────────────────────────────────────────────────────
describe('generateCertificate()', () => {
  // Valid inputs — return shape
  it('returns an object with text and code properties', () => {
    const result: CertificateResult = generateCertificate('Alice Souza', 'nodejs');
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('code');
  });

  it('returns certificate text containing the user name in uppercase', () => {
    const { text } = generateCertificate('Alice Souza', 'nodejs');
    expect(text).toContain('ALICE SOUZA');
  });

  it('trims leading/trailing spaces from userName before embedding in the cert', () => {
    const { text } = generateCertificate('  Alice Souza  ', 'nodejs');
    expect(text).toContain('ALICE SOUZA');
  });

  it('returns certificate text containing the track name', () => {
    expect(generateCertificate('Bob', 'python').text).toContain('Python');
  });

  it('contains the GEO-EXPLORER header with box-drawing characters', () => {
    const { text } = generateCertificate('Carol', 'typescript');
    expect(text).toContain('GEO-EXPLORER');
    expect(text).toContain('CERTIFICATE OF COMPLETION');
    expect(text).toContain('┌');
    expect(text).toContain('┐');
    expect(text).toContain('└');
    expect(text).toContain('┘');
    expect(text).toContain('│');
    expect(text).toContain('─');
    expect(text).toContain('├');
    expect(text).toContain('┤');
  });

  it('includes the number of modules completed', () => {
    expect(generateCertificate('Dave', 'nodejs').text).toContain('6 modules');
  });

  it('embeds the unique code in the certificate text', () => {
    const { text, code } = generateCertificate('Eve', 'typescript');
    expect(text).toContain(code);
    expect(code).toMatch(/^GEO-[A-Z0-9]{4}$/);
  });

  it('includes "Issued on" and "Certificate code" lines inside the box', () => {
    const { text, code } = generateCertificate('Dave', 'nodejs');
    expect(text).toContain('Issued on');
    expect(text).toContain(`Certificate code : ${code}`);
  });

  it('stores the certificate in the in-memory store', () => {
    const { code } = generateCertificate('Frank', 'python');
    expect(_getCertificateStore().has(code)).toBe(true);
  });

  it('stores trimmed userName in the record', () => {
    const { code } = generateCertificate('  Padded Name  ', 'nodejs');
    const record: CertificateRecord = _getCertificateStore().get(code)!;
    expect(record.userName).toBe('Padded Name');
  });

  it('generates unique codes for each call', () => {
    const { code: c1 } = generateCertificate('User1', 'nodejs');
    const { code: c2 } = generateCertificate('User2', 'nodejs');
    expect(c1).not.toBe(c2);
  });

  // RPA track
  it('generates a valid certificate for "rpa-python"', () => {
    const { text, code } = generateCertificate('Fernanda Lima', 'rpa-python');
    expect(text).toContain('FERNANDA LIMA');
    expect(text).toContain('RPA com Python e SQL');
    expect(text).toContain('7 modules');
    expect(code).toMatch(/^GEO-[A-Z0-9]{4}$/);
  });

  // Invalid inputs
  it('throws for an unrecognised technology', () => {
    expect(() => generateCertificate('Eve', 'java')).toThrow(
      'Track not found for technology: "java"'
    );
  });

  it('throws for an empty userName', () => {
    expect(() => generateCertificate('', 'nodejs')).toThrow('"userName" must not be empty');
  });

  it('throws for a whitespace-only userName', () => {
    expect(() => generateCertificate('   ', 'nodejs')).toThrow('"userName" must not be empty');
  });

  it('throws for an empty tech', () => {
    expect(() => generateCertificate('Alice', '')).toThrow('"tech" must not be empty');
  });

  it('throws for a whitespace-only tech', () => {
    expect(() => generateCertificate('Alice', '   ')).toThrow('"tech" must not be empty');
  });
});

// ── verifyCertificate ─────────────────────────────────────────────────────────
describe('verifyCertificate()', () => {
  // Valid lookups
  it('returns a valid CertificateRecord for a code just issued', () => {
    const { code } = generateCertificate('Grace', 'nodejs');
    const record: CertificateRecord = verifyCertificate(code);
    expect(record.code).toBe(code);
    expect(record.userName).toBe('Grace');
    expect(record.tech).toBe('nodejs');
    expect(record.trackName).toBe('Node.js');
    expect(typeof record.issuedAt).toBe('string');
  });

  it('is case-insensitive for the code lookup', () => {
    const { code } = generateCertificate('Hiro', 'python');
    const record = verifyCertificate(code.toLowerCase());
    expect(record.userName).toBe('Hiro');
  });

  it('trims whitespace around the code before lookup', () => {
    const { code } = generateCertificate('Ivan', 'typescript');
    const record = verifyCertificate(`  ${code}  `);
    expect(record.code).toBe(code);
  });

  it('verifies a certificate issued for "rpa-python"', () => {
    const { code } = generateCertificate('Isabella Costa', 'rpa-python');
    const record = verifyCertificate(code);
    expect(record.tech).toBe('rpa-python');
    expect(record.trackName).toBe('RPA com Python e SQL');
  });

  it('does not find a code after the store is cleared', () => {
    const { code } = generateCertificate('Jake', 'typescript');
    _getCertificateStore().clear();
    expect(() => verifyCertificate(code)).toThrow('not found');
  });

  // Invalid inputs
  it('throws a clear, friendly message for an unrecognised code', () => {
    const err = (() => {
      try { verifyCertificate('GEO-XXXX'); }
      catch (e) { return e as Error; }
    })()!;
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain('GEO-XXXX');
    expect(err.message).toContain('not found');
    expect(err.message).toContain('invalid or was issued in a different session');
  });

  it('throws for an empty code', () => {
    expect(() => verifyCertificate('')).toThrow('"code" must not be empty');
  });

  it('throws for a whitespace-only code', () => {
    expect(() => verifyCertificate('   ')).toThrow('"code" must not be empty');
  });

  it('throws for a syntactically valid but non-existent code', () => {
    expect(() => verifyCertificate('GEO-0000')).toThrow('not found');
  });
});
