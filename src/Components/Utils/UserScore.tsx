import React, { useContext, useState } from 'react';
import { AppContext, ScoreDetail } from 'Contexts/AppContext';
import { getScoreDetails } from 'Components/Tools/ScoreUtils';
import { useNavigate } from 'react-router-dom';
import HomeIcon from 'Svgs/HomeIcon';
import BackArrow from 'Svgs/BackArrow';
import ExpandIcon from 'Svgs/ExpandIcon';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Utils/UserScore.css';

const UserScore: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    gameMode,
    players,
    setPlayers,
    setCurrentCardGuesses,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    setCurrentIndex,
    setRevealedRanks,
    isSubmitted,
    setFinished,
  } = context;

  const [confirm, setConfirm] = useState(false);
  const [expand, setExpand] = useState(false);

  const navigate = useNavigate();

  const calculateDisplayScore = (
    playerScores: ScoreDetail[],
    playerOrder: number
  ) => {
    if (gameMode === 'shift') {
      const { correct, total } = getScoreDetails(playerScores);
      return `${correct}/${total}`;
    }

    // Original salt mode calculation
    const currentRoundDiff = context?.currentCardStats
      ? Math.abs(
          context.currentCardStats.cardRank -
            (context.currentCardGuesses[playerOrder] || 0)
        )
      : 0;

    const totalDiff =
      playerScores.reduce((acc, curr) => acc + curr.diff, 0) +
      (context?.isSubmitted ? currentRoundDiff : 0);

    return totalDiff;
  };

  // New function to get score label based on game mode
  const getScoreLabel = () => {
    return gameMode === 'shift' ? 'Correct:' : 'Score:';
  };

  const handleConfirm = () => {
    setConfirm(true);

    setTimeout(() => {
      setConfirm(false);
    }, 3000);
  };

  const handleHome = () => {
    setCurrentIndex(0);
    setCurrentCardGuesses({});
    setRevealedRanks([]);
    setFinished(false);
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        scores: [],
      }))
    );
    setCurrentPlayerIndex(0);
    navigate('/');
  };

  const handleExpand = () => {
    setExpand(!expand);
  };

  return (
    <div className='user-score-container'>
      {players.length === 1 ? (
        <div className='user-score-score-container'>
          <span className='score-label'>{getScoreLabel()}</span>
          <span className='score-value'>
            {calculateDisplayScore(players[0].scores, players[0].order)}
          </span>
        </div>
      ) : (
        <>
          <div className='expand-container'>
            {expand ? (
              <ExpandIcon
                className='expand-icon'
                onClick={() => handleExpand()}
              />
            ) : (
              <ExpandIcon
                className='expand-icon-left'
                onClick={() => handleExpand()}
              />
            )}
          </div>
          {expand ? (
            <div className='multi-player-scores'>
              {players.map((player, index) => {
                let playerClass = '';
                if (isSubmitted) {
                  playerClass = 'guessed';
                } else {
                  if (index < currentPlayerIndex) {
                    playerClass = 'guessed';
                  } else if (index === currentPlayerIndex) {
                    playerClass = 'current-player';
                  }
                }
                return (
                  <div
                    key={player.order}
                    className={`player-score ${playerClass}`}
                  >
                    <span className='player-name'>
                      {player.name.trim() || `Player ${index + 1}`}
                    </span>
                    <span className='multi-player-total'>
                      {calculateDisplayScore(player.scores, player.order)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='single-player-score-container'>
              <div
                key={players[currentPlayerIndex].order}
                className={`player-score ${
                  isSubmitted ? 'guessed' : 'current-player'
                }`}
              >
                <span className='player-name'>
                  {players[currentPlayerIndex].name.trim() ||
                    `Player ${currentPlayerIndex + 1}`}
                </span>
                <span className='multi-player-total'>
                  {calculateDisplayScore(
                    players[currentPlayerIndex].scores,
                    players[currentPlayerIndex].order
                  )}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <div className='user-score-home-container'>
        <div className='home-icons'>
          {confirm ? (
            <Tooltip
              title={
                <>
                  <div className='tooltip-text-container'>
                    <p className='tooltip-text'>Confirm</p>
                  </div>
                </>
              }
              enterDelay={600}
              leaveDelay={200}
              placement='bottom'
            >
              <BackArrow className='back-arrow-icon' onClick={handleHome} />
            </Tooltip>
          ) : (
            <Tooltip
              title={
                <>
                  <div className='tooltip-text-container'>
                    <p className='tooltip-text'>Home</p>
                  </div>
                </>
              }
              enterDelay={600}
              leaveDelay={100}
              placement='bottom'
            >
              <HomeIcon className='home-icon' onClick={handleConfirm} />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserScore;
