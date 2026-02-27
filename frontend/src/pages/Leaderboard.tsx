import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiAward } from 'react-icons/fi'; // FiTrophy → FiAward
import { supabase, LeaderboardEntry } from '../lib/supabase';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // 실시간 업데이트 구독
    const subscription = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'progress' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(50);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else if (data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
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
            <span>챌린지로 돌아가기</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FiAward size={40} className="text-yellow-400" />
          <h1 className="text-4xl font-bold">리더보드</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">로딩 중...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg">아직 챌린지를 해결한 사용자가 없습니다.</p>
            <Link to="/challenges" className="text-blue-400 hover:underline mt-4 inline-block">
              첫 번째가 되어보세요!
            </Link>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4 text-left">순위</th>
                  <th className="p-4 text-left">사용자</th>
                  <th className="p-4 text-center">해결</th>
                  <th className="p-4 text-center">점수</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr 
                    key={entry.user_id} 
                    className={`border-t border-gray-700 hover:bg-gray-750 transition-colors ${
                      index < 3 ? 'bg-gray-750' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span className="text-2xl font-bold">
                        {getRankEmoji(index + 1)}
                      </span>
                    </td>
                    <td className="p-4">
  <span className="font-medium">
    {entry.nickname || entry.email}
  </span>
  {entry.nickname && (
    <span className="text-gray-500 text-sm ml-2">
      ({entry.email})
    </span>
  )}
</td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full font-bold">
                        {entry.solved_count}/10
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-green-400 font-bold text-lg">
                        {entry.total_points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};