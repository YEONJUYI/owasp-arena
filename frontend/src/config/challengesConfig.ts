import challengesData from '../data/challenges.json';
import { Challenge } from '../types';

// Render URL 매핑
const RENDER_URLS: { [key: string]: string } = {
  'a01-broken-access': 'https://owasp-a01-broken-access.onrender.com',
  'a02-misconfiguration': 'https://owasp-a02-misconfiguration.onrender.com',
  'a03-supply-chain': 'https://owasp-a03-supply-chain.onrender.com',
  'a04-crypto-failures': 'https://owasp-a04-crypto-failures.onrender.com',
  'a05-injection': 'https://owasp-a05-injection.onrender.com',
  'a06-insecure-design': 'https://owasp-a06-insecure-design.onrender.com',
  'a07-auth-failures': 'https://owasp-a07-auth-failures.onrender.com',
  'a08-integrity-failures': 'https://owasp-a08-integrity-failures.onrender.com',
  'a09-logging-failures': 'https://owasp-a09-logging-failures.onrender.com',
  'a10-exception-handling': 'https://owasp-a10-exception.onrender.com',
};

// 무조건 Render URL 사용하도록 강제
export const challenges: Challenge[] = challengesData.challenges.map(challenge => ({
  ...challenge,
  container_url: RENDER_URLS[challenge.id]  // || 제거! 무조건 Render URL
}));