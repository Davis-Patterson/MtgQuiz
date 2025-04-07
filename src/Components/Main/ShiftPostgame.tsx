import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { calculateShiftScore } from 'Components/Tools/ScoreUtils';
import SaltLogo from 'Assets/Images/salt-logo.webp';
import ChevronIcon from 'Svgs/ChevronIcon';
import StripedArrow from 'Svgs/StripedArrow';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Main/ShiftPostgame.css';

const ShiftPostgame: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    players,
    numberOfCards,
    cardData,
    selectedCards,
    setCurrentIndex,
    setCurrentShiftGuesses,
    setRevealedRanks,
    finished,
    setFinished,
    setFullScreenImage,
    setPlayers,
  } = context;

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!finished) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [finished]);

  useEffect(() => {
    if (cardData && cardData.length > 0) {
      const randomIndex = Math.floor(Math.random() * cardData.length);
      const artCropUrl = cardData[randomIndex].card.front.imgs.art_crop;
      setBackgroundImage(artCropUrl);
    }
  }, [cardData]);

  const handleHome = () => {
    setCurrentIndex(0);
    setCurrentShiftGuesses({});
    setPlayers(
      players.map((player) => ({
        ...player,
        scores: [],
      }))
    );
    setRevealedRanks([]);
    setFinished(false);
  };

  const calculatePlayerPercentage = (
    playerScores: (typeof players)[0]['scores']
  ) => {
    const correctAnswers = calculateShiftScore(playerScores);
    return numberOfCards > 0
      ? ((correctAnswers / numberOfCards) * 100).toFixed(1)
      : '0.0';
  };

  const calculateGlobalAverageTotal = (players: typeof context.players) => {
    const totalCorrect = players.reduce(
      (sum, player) => sum + calculateShiftScore(player.scores),
      0
    );
    return totalCorrect / (players.length || 1);
  };

  const globalAvgTotal = calculateGlobalAverageTotal(players);

  if (!finished) {
    return (
      <div className='page-container'>
        {backgroundImage && (
          <>
            <div
              className='background-img'
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <div className='background-overlay' />
          </>
        )}
        <div className='shift-results-not-found shadow-glow'>
          <div className='shift-results-not-found-header'>
            <div className='shift-results-not-found-header-text-container'>
              <h1 className='shift-results-not-found-header-text'>
                404: No Data
              </h1>
            </div>
            <div className='shift-results-not-found-header-subtext-container'>
              <p className='shift-results-not-found-header-subtext'>
                There was no game session found.
              </p>
              <p className='shift-results-not-found-header-subtext'>
                Redirecting to homepage...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className='shift-results-container'>
      {backgroundImage && (
        <>
          <div
            className='background-img'
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className='background-overlay' />
        </>
      )}

      {players.length === 1 ? (
        <div className='quiz-results' ref={resultsRef}>
          <header className='shift-results-header'>
            <div className='shift-results-header-top'>
              <div className='shift-results-title-container'>
                <p className='shift-results-score-label'>Final Score:</p>
                <div className='shift-results-score-container'>
                  <p className='shift-results-score orange-glow'>
                    {`${calculatePlayerPercentage(players[0].scores)}%`}
                  </p>
                  <p className='shift-results-fraction-score'>{`Total: ${calculateShiftScore(
                    players[0].scores
                  )}/${numberOfCards}`}</p>
                </div>
              </div>
              <Link to='/' className='shift-results-logo-img'>
                <img
                  src={SaltLogo}
                  alt='salt logo'
                  className='shift-results-salt-logo orange-glow'
                />
              </Link>
            </div>
            <div className='shift-results-header-bottom'>
              <div className='shift-results-button-container'>
                <Link
                  to='/'
                  onClick={handleHome}
                  className='guess-button orange-glow'
                >
                  Home
                </Link>
              </div>
            </div>
          </header>
          <div className='shift-results-content'>
            {players[0].scores.map((score, index) => {
              const card = selectedCards[index];
              const actualDirection =
                (card.rank ?? 0) < (card.previousRank ?? 0)
                  ? 1
                  : (card.rank ?? 0) > (card.previousRank ?? 0)
                  ? -1
                  : 0;

              return (
                <div key={index} className='shift-results-card'>
                  <div className='shift-results-image-container'>
                    <img
                      src={card.card.front.imgs.small}
                      alt={card.card.front.name}
                      className='shift-results-card-image'
                      onClick={() =>
                        setFullScreenImage(card.card.front.imgs.large)
                      }
                    />
                  </div>
                  <div className='shift-results-content-container'>
                    <h4
                      className={`results-revealed-direction ${
                        actualDirection === 1 ? 'increased' : 'decreased'
                      }`}
                    >
                      {card.previousRank !== undefined && card.rank !== null ? (
                        <div className='results-direction-container'>
                          <p>
                            {actualDirection === 1
                              ? 'Increased'
                              : actualDirection === -1
                              ? 'Decreased'
                              : 'Same'}
                          </p>
                          <ChevronIcon
                            className={`chevron-icon ${
                              actualDirection === 1 ? 'increase' : 'decrease'
                            }`}
                          />
                          <p>
                            {Math.abs(
                              (card.previousRank ?? 0) - (card.rank ?? 0)
                            )}{' '}
                            rank
                            {Math.abs(
                              (card.previousRank ?? 0) - (card.rank ?? 0)
                            ) !== 1
                              ? 's'
                              : ''}
                          </p>
                        </div>
                      ) : (
                        'Rank change'
                      )}
                    </h4>

                    <div className='results-year-labels'>
                      <Tooltip
                        title={<>{card.previousYear} Card Rank</>}
                        enterDelay={400}
                        placement='top'
                      >
                        <div className='results-year-label-value-container'>
                          <p
                            className={`results-year-label-value ${
                              card.previousRank === 100 ? 'max' : ''
                            }`}
                          >
                            {card.previousRank}
                          </p>
                        </div>
                      </Tooltip>

                      <div className='results-year-label-years-container'>
                        <span className='results-year-label-text'>
                          {card.previousYear}
                        </span>
                        <StripedArrow className='striped-arrow' />
                        <span className='results-year-label-text'>
                          {card.currentYear}
                        </span>
                      </div>

                      <Tooltip
                        title={<>{card.currentYear} Card Rank</>}
                        enterDelay={400}
                        placement='top'
                      >
                        <div className='results-year-label-value-container'>
                          <p
                            className={`results-year-label-value ${
                              card.rank === 100 ? 'max' : ''
                            }`}
                          >
                            {card.rank}
                          </p>
                        </div>
                      </Tooltip>
                    </div>

                    <div className='results-result-status-container'>
                      <div className='results-result-status-label'>Guess:</div>
                      <div
                        className={`results-result-status ${
                          score.correct ? 'correct' : 'incorrect'
                        }`}
                      >
                        {score.correct ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className='multi-quiz-results' ref={resultsRef}>
          <header className='multi-shift-results-header'>
            <div className='multi-shift-results-header-top'>
              <img
                src={SaltLogo}
                alt='salt logo'
                className='shift-results-salt-logo orange-glow'
              />
              <div className='multi-shift-results-title-container'>
                <p className='multi-shift-results-score-label'>Final Scores</p>
              </div>
              <div className='multi-shift-results-player-rankings'>
                {players
                  .slice()
                  .sort(
                    (a, b) =>
                      calculateShiftScore(b.scores) -
                      calculateShiftScore(a.scores)
                  )
                  .map((player, index) => (
                    <div key={player.id} className='player-ranking'>
                      <span className='ranking-position'>#{index + 1}</span>
                      <span className='ranking-name'>
                        {player.name.trim() || `Player ${player.order}`}
                      </span>
                      <span className='ranking-score'>
                        {`${calculateShiftScore(
                          player.scores
                        )}/${numberOfCards}`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className='shift-results-header-bottom'>
              <div className='shift-results-button-container'>
                <Link
                  to='/'
                  onClick={handleHome}
                  className='guess-button orange-glow'
                >
                  Home
                </Link>
              </div>
            </div>
          </header>
          <div className='multi-shift-results-content-wrapper'>
            <div className='multi-shift-results-content'>
              {players.map((player) => {
                const totalScore = calculateShiftScore(player.scores);
                return (
                  <div key={player.id} className='player-shift-results-column'>
                    <div className='multi-player-header'>
                      <div className='multi-player-header-top'>
                        <h3 className='shift-results-player-name'>
                          {player.name.trim() || `Player ${player.order}`}
                        </h3>
                        <div className='player-total-score-container'>
                          <p className='player-total-score orange-glow'>
                            {`${calculatePlayerPercentage(player.scores)}%`}
                          </p>
                        </div>
                      </div>
                      <div className='multi-player-header-bottom'>
                        <div className='avg-stats-container'>
                          <p className='multi-shift-results-avg-text'>
                            Score: {`${totalScore}/${numberOfCards}`}
                          </p>
                          <p className='multi-shift-results-avg-text'>
                            Avg Score: {globalAvgTotal.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {player.scores.map((score, scoreIndex) => {
                      const card = selectedCards[scoreIndex];
                      const actualDirection =
                        (card.rank ?? 0) < (card.previousRank ?? 0)
                          ? 1
                          : (card.rank ?? 0) > (card.previousRank ?? 0)
                          ? -1
                          : 0;

                      return (
                        <div
                          key={scoreIndex}
                          className='multi-shift-results-card'
                        >
                          <div className='multi-shift-results-title-content'>
                            <div className='multi-shift-results-card-name-container'>
                              <div className='multi-shift-results-card-name'>
                                {card.card.front.name}
                              </div>
                            </div>
                            <div className='multi-shift-results-main-content'>
                              <div className='multi-shift-results-image-container'>
                                <img
                                  src={card.card.front.imgs.small}
                                  alt={card.card.front.name}
                                  className='multi-shift-results-card-image'
                                  onClick={() =>
                                    setFullScreenImage(
                                      card.card.front.imgs.large
                                    )
                                  }
                                />
                              </div>
                              <div className='shift-multi-results-content-container'>
                                <h4
                                  className={`multi-revealed-direction ${
                                    actualDirection === 1
                                      ? 'increased'
                                      : 'decreased'
                                  }`}
                                >
                                  {card.previousRank !== undefined &&
                                  card.rank !== null ? (
                                    <div className='multi-direction-container'>
                                      <p>
                                        {actualDirection === 1
                                          ? 'Increased'
                                          : actualDirection === -1
                                          ? 'Decreased'
                                          : 'Same'}
                                      </p>
                                      <ChevronIcon
                                        className={`chevron-icon ${
                                          actualDirection === 1
                                            ? 'increase'
                                            : 'decrease'
                                        }`}
                                      />
                                      <p>
                                        {Math.abs(
                                          (card.previousRank ?? 0) -
                                            (card.rank ?? 0)
                                        )}{' '}
                                        rank
                                        {Math.abs(
                                          (card.previousRank ?? 0) -
                                            (card.rank ?? 0)
                                        ) !== 1
                                          ? 's'
                                          : ''}
                                      </p>
                                    </div>
                                  ) : (
                                    'Rank change'
                                  )}
                                </h4>

                                <div className='multi-year-labels'>
                                  <Tooltip
                                    title={<>{card.previousYear} Card Rank</>}
                                    enterDelay={400}
                                    placement='top'
                                  >
                                    <div className='multi-year-label-value-container'>
                                      <p
                                        className={`multi-year-label-value ${
                                          card.previousRank === 100 ? 'max' : ''
                                        }`}
                                      >
                                        {card.previousRank}
                                      </p>
                                    </div>
                                  </Tooltip>

                                  <div className='multi-year-label-years-container'>
                                    <span className='multi-year-label-text'>
                                      {card.previousYear}
                                    </span>
                                    <StripedArrow className='striped-arrow' />
                                    <span className='multi-year-label-text'>
                                      {card.currentYear}
                                    </span>
                                  </div>

                                  <Tooltip
                                    title={<>{card.currentYear} Card Rank</>}
                                    enterDelay={400}
                                    placement='top'
                                  >
                                    <div className='multi-year-label-value-container'>
                                      <p
                                        className={`multi-year-label-value ${
                                          card.rank === 100 ? 'max' : ''
                                        }`}
                                      >
                                        {card.rank}
                                      </p>
                                    </div>
                                  </Tooltip>
                                </div>

                                <div className='multi-result-status-container'>
                                  <div className='multi-result-status-label'>
                                    Guess:
                                  </div>
                                  <div
                                    className={`multi-result-status ${
                                      score.correct ? 'correct' : 'incorrect'
                                    }`}
                                  >
                                    {score.correct ? 'Correct' : 'Incorrect'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShiftPostgame;
