import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiAward, FiCheck, FiClock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { challenges } from '../config/challengesConfig';

interface UserProgress {
  challenge_id: string;
  solved: boolean;
  hints_used: number;
  solve_time: string | null;
  created_at: string;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [rank, setRank] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
      fetchUserRank();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', user.id)
      .order('solve_time', { ascending: false });

    if (data) {
      setProgress(data);
      
      // 총 점수 계산
      const points = data
        .filter(p => p.solved)
        .reduce((sum, p) => {
          const challenge = challenges.find(c => c.id === p.challenge_id);
          return sum + (challenge?.points || 0);
        }, 0);
      
      setTotalPoints(points);
    }
    setLoading(false);
  };

  const fetchUserRank = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('leaderboard')
      .select('user_id, total_points')
      .order('total_points', { ascending: false });

    if (data) {
      const userRank = data.findIndex(entry => entry.user_id === user.id) + 1;
      setRank(userRank);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <Link to="/auth" className="text-blue-400 hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  const solvedChallenges = progress.filter(p => p.solved);
  const nickname = user.user_metadata?.nickname;

  // 난이도별 통계
  const difficultyStats = {
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 }
  };

  challenges.forEach(challenge => {
    const difficulty = challenge.difficulty as 'easy' | 'medium' | 'hard';
    difficultyStats[difficulty].total++;
    
    if (progress.find(p => p.challenge_id === challenge.id && p.solved)) {
      difficultyStats[difficulty].solved++;
    }
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/challenges"
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft size={24} />
            <span>챌린지로 돌아가기</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 프로필 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-gray-900">
              {nickname ? nickname.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {nickname || user.email}
              </h1>
              <p className="text-blue-100">{user.email}</p>
              <p className="text-blue-200 text-sm mt-2">
                가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <FiCheck className="text-green-500 text-4xl mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-400">{solvedChallenges.length}</div>
            <div className="text-gray-400">해결한 챌린지</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <FiAward className="text-yellow-500 text-4xl mx-auto mb-3" />
            <div className="text-3xl font-bold text-yellow-400">{totalPoints}</div>
            <div className="text-gray-400">총 점수</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <div className="text-3xl font-bold text-blue-400">#{rank || '-'}</div>
            <div className="text-gray-400">순위</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <FiClock className="text-purple-500 text-4xl mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-400">
              {progress.reduce((sum, p) => sum + p.hints_used, 0)}
            </div>
            <div className="text-gray-400">사용한 힌트</div>
          </div>
        </div>

        {/* 난이도별 진행률 */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">난이도별 진행률</h2>
          <div className="space-y-4">
            {Object.entries(difficultyStats).map(([difficulty, stats]) => (
              <div key={difficulty}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium capitalize">{difficulty}</span>
                  <span className="text-gray-400">
                    {stats.solved} / {stats.total}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      difficulty === 'easy' ? 'bg-green-500' :
                      difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(stats.solved / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 해결한 챌린지 목록 */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">
            해결한 챌린지 ({solvedChallenges.length}/10)
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-400">로딩 중...</div>
          ) : solvedChallenges.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              아직 해결한 챌린지가 없습니다.
              <Link to="/challenges" className="block mt-2 text-blue-400 hover:underline">
                챌린지 시작하기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {solvedChallenges.map(p => {
                const challenge = challenges.find(c => c.id === p.challenge_id);
                if (!challenge) return null;

                return (
                  <Link
                    key={p.challenge_id}
                    to={`/challenges/${p.challenge_id}`}
                    className="block bg-gray-900 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{challenge.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg">{challenge.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-blue-400 text-sm">{challenge.category}</span>
                            <span className="text-green-400 text-sm">+{challenge.points}pts</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        {p.solve_time && (
                          <div>{new Date(p.solve_time).toLocaleDateString('ko-KR')}</div>
                        )}
                        <div>힌트 {p.hints_used}개 사용</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};