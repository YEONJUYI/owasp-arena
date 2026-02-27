import challengesData from '../data/challenges.json';
import { Challenge } from '../types';

// 환경변수에서 챌린지 URL 가져오기
const CHALLENGE_URLS: { [key: string]: string } = {
  'a01-broken-access': process.env.REACT_APP_A01_URL || 'http://localhost:5000',
  'a02-misconfiguration': process.env.REACT_APP_A02_URL || 'http://localhost:5001',
  'a03-supply-chain': process.env.REACT_APP_A03_URL || 'http://localhost:5002',
  'a04-crypto-failures': process.env.REACT_APP_A04_URL || 'http://localhost:5003',
  'a05-injection': process.env.REACT_APP_A05_URL || 'http://localhost:5004',
  'a06-insecure-design': process.env.REACT_APP_A06_URL || 'http://localhost:5005',
  'a07-auth-failures': process.env.REACT_APP_A07_URL || 'http://localhost:5006',
  'a08-integrity-failures': process.env.REACT_APP_A08_URL || 'http://localhost:5007',
  'a09-logging-failures': process.env.REACT_APP_A09_URL || 'http://localhost:5008',
  'a10-exception-handling': process.env.REACT_APP_A10_URL || 'http://localhost:5009',
};

// challenges.json의 container_url을 환경변수로 덮어쓰기
export const challenges: Challenge[] = challengesData.challenges.map(challenge => ({
  ...challenge,
  container_url: CHALLENGE_URLS[challenge.id] || challenge.container_url
}));