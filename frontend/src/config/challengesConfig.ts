import challengesData from '../data/challenges.json';
import { Challenge } from '../types';

// 환경변수에서 챌린지 URL 가져오기
const CHALLENGE_URLS: { [key: string]: string } = {
  'a01-broken-access': process.env.REACT_APP_A01_URL || 'https://owasp-a01-broken-access.onrender.com',
  'a02-misconfiguration': process.env.REACT_APP_A02_URL || 'https://owasp-a02-misconfiguration.onrender.com',
  'a03-supply-chain': process.env.REACT_APP_A03_URL || 'https://owasp-a03-supply-chain.onrender.com',
  'a04-crypto-failures': process.env.REACT_APP_A04_URL || 'https://owasp-a04-crypto-failures.onrender.com',
  'a05-injection': process.env.REACT_APP_A05_URL || 'https://owasp-a05-injection.onrender.com',
  'a06-insecure-design': process.env.REACT_APP_A06_URL || 'https://owasp-a06-insecure-design.onrender.com',
  'a07-auth-failures': process.env.REACT_APP_A07_URL || 'https://owasp-a07-auth-failures.onrender.com',
  'a08-integrity-failures': process.env.REACT_APP_A08_URL || 'https://owasp-a08-integrity-failures.onrender.com',
  'a09-logging-failures': process.env.REACT_APP_A09_URL || 'https://owasp-a09-logging-failures.onrender.com',
  'a10-exception-handling': process.env.REACT_APP_A10_URL || 'https://owasp-a10-exception.onrender.com',
};

// challenges.json의 container_url을 환경변수로 덮어쓰기
export const challenges: Challenge[] = challengesData.challenges.map(challenge => ({
  ...challenge,
  container_url: CHALLENGE_URLS[challenge.id] || challenge.container_url
}));