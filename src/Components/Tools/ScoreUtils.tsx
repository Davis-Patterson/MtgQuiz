import { ScoreDetail } from 'Contexts/AppContext';

export const calculateShiftScore = (scores: ScoreDetail[]): number => {
  return scores.filter((score) => score.correct).length;
};

export const getScoreDetails = (scores: ScoreDetail[]) => {
  return {
    total: scores.length,
    correct: scores.filter((score) => score.correct).length,
    incorrect: scores.filter((score) => !score.correct).length,
  };
};
