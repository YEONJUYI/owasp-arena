import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiLock } from 'react-icons/fi';
import { Challenge } from '../types';
import { StorageService } from '../utils/storage';

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const isSolved = StorageService.isSolved(challenge.id);

  const difficultyColor: Record<string, string> = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500'
  };

  return (
    <Link to={`/challenges/${challenge.id}`}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 cursor-pointer relative overflow-hidden group">
        {/* 해결 배지 */}
        {isSolved && (
          <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2">
            <FiCheck size={20} />
          </div>
        )}

        {/* 아이콘 */}
        <div className="text-5xl mb-4">{challenge.icon}</div>

        {/* 카테고리 & 난이도 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-400 font-mono text-sm">{challenge.category}</span>
          <span className={`${difficultyColor[challenge.difficulty] || 'bg-gray-500'} text-white text-xs px-2 py-1 rounded`}>
            {challenge.difficulty.toUpperCase()}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {challenge.title}
        </h3>

        {/* 설명 */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {challenge.description}
        </p>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {challenge.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* 포인트 */}
        <div className="flex items-center justify-between">
          <span className="text-green-400 font-bold">{challenge.points} pts</span>
          {!isSolved && <FiLock className="text-gray-500" />}
        </div>
      </div>
    </Link>
  );
};