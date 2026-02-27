import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink, FiEye, FiCheck } from 'react-icons/fi';
import { Challenge } from '../types';
import { FlagSubmit } from '../components/FlagSubmit';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { challenges } from '../config/challengesConfig';

export const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [showHints, setShowHints] = useState<boolean[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  // 해결 상태 확인 함수
  const checkSolvedStatus = async (challengeId: string) => {
    if (!user) return;
    
    const { data } = await supabase
      .from('progress')
      .select('solved')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();
    
    if (data?.solved) {
      setIsSolved(true);
    }
  };

  useEffect(() => {
    const found = challenges.find(c => c.id === id);
    if (found) {
      setChallenge(found);
      setShowHints(new Array(found.hints.length).fill(false));
      
      if (user) {
        checkSolvedStatus(found.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">챌린지를 찾을 수 없습니다</h2>
          <Link to="/challenges" className="text-blue-400 hover:underline">
            챌린지 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const difficultyColor: Record<string, string> = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500'
  };

  const toggleHint = async (index: number) => {
    const newShowHints = [...showHints];
    const isOpening = !newShowHints[index];
    newShowHints[index] = isOpening;
    setShowHints(newShowHints);
    
    // 힌트를 처음 열 때만 DB 업데이트
    if (isOpening && user) {
      const { data: currentProgress } = await supabase
        .from('progress')
        .select('hints_used')
        .eq('user_id', user.id)
        .eq('challenge_id', challenge.id)
        .single();

      const currentHints = currentProgress?.hints_used || 0;

      await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          challenge_id: challenge.id,
          hints_used: currentHints + 1,
          solved: isSolved // 기존 해결 상태 유지
        }, {
          onConflict: 'user_id,challenge_id'
        });
    }
  };

  const handleSuccess = () => {
    setIsSolved(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/challenges"
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <FiArrowLeft size={24} />
            <span>챌린지 목록</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="text-7xl">{challenge.icon}</div>
                {isSolved && (
                  <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
                    <FiCheck />
                    <span>해결완료</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-blue-400 font-mono text-lg font-bold">
                  {challenge.category}
                </span>
                <span className={`${difficultyColor[challenge.difficulty] || 'bg-gray-500'} text-white px-3 py-1 rounded font-bold`}>
                  {challenge.difficulty.toUpperCase()}
                </span>
                <span className="text-green-400 font-bold ml-auto">
                  {challenge.points} pts
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>

              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {challenge.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {challenge.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 수정됨: <a> 태그 복구 */}
              <a
                href={challenge.container_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <FiExternalLink />
                챌린지 열기
              </a>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">💡 힌트</h3>
              <div className="space-y-3">
                {challenge.hints.map((hint, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4">
                    <button
                      onClick={() => toggleHint(index)}
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium mb-2"
                    >
                      <FiEye />
                      힌트 {index + 1} {showHints[index] ? '숨기기' : '보기'}
                    </button>
                    {showHints[index] && (
                      <p className="text-gray-300 ml-6">{hint}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <FlagSubmit challenge={challenge} onSuccess={handleSuccess} />

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">📚 참고 자료</h3>
              <div className="space-y-2">
                {/* 수정됨: <a> 태그 복구 */}
                <a
                  href="https://owasp.org/www-project-top-ten/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-400 hover:underline"
                >
                  OWASP Top 10 문서
                </a>
                <a
                  href="https://portswigger.net/web-security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-400 hover:underline"
                >
                  PortSwigger Academy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};