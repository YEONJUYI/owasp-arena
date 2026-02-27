import React from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiAward, FiBook, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">OWASP Arena</h1>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-gray-400">
                  {user.user_metadata?.nickname || user.email}
                </span>
                <Link to="/challenges" className="text-blue-400 hover:text-blue-300">
                  챌린지
                </Link>
                <Link to="/leaderboard" className="text-blue-400 hover:text-blue-300">
                  리더보드
                </Link>
                <Link to="/profile" className="text-blue-400 hover:text-blue-300">
                  프로필
                </Link>
                <button
                  onClick={signOut}
                  className="text-red-400 hover:text-red-300"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                <FiLogIn />
                로그인
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">
            OWASP Arena
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            OWASP Top 10 2025 기반 웹 보안 워게임
          </p>
          
          {user ? (
            <Link
              to="/challenges"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              🎯 챌린지 시작하기
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              🎯 시작하기 (로그인 필요)
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <FiTarget className="text-blue-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">10가지 취약점</h3>
            <p className="text-gray-400">
              OWASP Top 10 2025의 모든 카테고리를 실습으로 체험
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <FiAward className="text-green-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">난이도별 챌린지</h3>
            <p className="text-gray-400">
              Easy부터 Hard까지 단계별로 학습
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <FiBook className="text-purple-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">힌트 시스템</h3>
            <p className="text-gray-400">
              막힐 때 힌트를 활용하여 학습 효과 극대화
            </p>
          </div>
        </div>

        {/* OWASP Top 10 List */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">📋 OWASP Top 10 2025</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <ol className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A01</span>
                <span>Broken Access Control</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A02</span>
                <span>Security Misconfiguration</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A03</span>
                <span>Software Supply Chain Failures</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A04</span>
                <span>Cryptographic Failures</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A05</span>
                <span>Injection</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A06</span>
                <span>Insecure Design</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A07</span>
                <span>Authentication Failures</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A08</span>
                <span>Software or Data Integrity Failures</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A09</span>
                <span>Logging & Monitoring Failures</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">A10</span>
                <span>Mishandling of Exceptional Conditions</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Made with ❤️ for Cybersecurity Education</p>
          <p className="mt-2">Korea Polytechnic University Seoul Gangseo Campus</p>
        </div>
      </footer>
    </div>
  );
};