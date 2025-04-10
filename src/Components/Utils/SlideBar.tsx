import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from 'Contexts/AppContext';
import PinIcon from 'Svgs/PinIcon';
import PointIcon from 'Svgs/PointIcon';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Utils/SlideBar.css';

const SlideBar: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    rangeOfQuiz,
    currentCardGuesses,
    setCurrentCardGuesses,
    revealedRanks,
    canScroll,
    setFullScreenImage,
    players,
    currentPlayerIndex,
  } = context;

  const [dragging, setDragging] = useState(false);
  const [showPointerHint, setShowPointerHint] = useState(false);
  const [hasGuessed, setHasGuessed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dashes = Array.from({ length: rangeOfQuiz + 1 }, (_, i) => i);
  const currentPlayer = players[currentPlayerIndex];
  const currentGuess = currentCardGuesses[currentPlayer.order] || 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canScroll) return;
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canScroll || !dragging || !containerRef.current) return;
    updateGuessFromPointer(e.clientY);
  };

  const handleClickContainer = (e: React.MouseEvent) => {
    if (!canScroll || dragging || !containerRef.current) return;
    updateGuessFromPointer(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canScroll) return;
    setDragging(true);
    updateGuessFromPointer(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canScroll || !dragging || !containerRef.current) return;
    updateGuessFromPointer(e.touches[0].clientY);
    e.preventDefault();
  };

  const updateGuessFromPointer = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const rawPercentage = (1 - offsetY / rect.height) * 100;
    let newGuess = Math.round((rawPercentage / 100) * rangeOfQuiz);

    if (newGuess === 0) {
      newGuess = 0;
    } else {
      newGuess = rangeOfQuiz + 1 - newGuess;
      newGuess = Math.max(1, Math.min(rangeOfQuiz, newGuess));
      if (rawPercentage < 0) {
        newGuess = 0;
      }
    }

    setCurrentCardGuesses((prev) => {
      const currentGuess = prev[currentPlayer.order] || 0;
      if (currentGuess === newGuess) {
        return prev;
      }
      return { ...prev, [currentPlayer.order]: newGuess };
    });
  };

  useEffect(() => {
    if (currentGuess > 0) {
      setShowPointerHint(false);
      setHasGuessed(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [currentGuess]);

  useEffect(() => {
    if (!hasGuessed) {
      timeoutRef.current = setTimeout(() => {
        if (!hasGuessed) {
          setShowPointerHint(true);
        }
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [hasGuessed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouch = (e: TouchEvent) => e.preventDefault();

    container.addEventListener('touchstart', handleTouch, { passive: false });
    container.addEventListener('touchmove', handleTouch, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  return (
    <>
      <div className='slidebar-container'>
        <p className={canScroll ? 'slidebar-label' : 'slidebar-label-inactive'}>
          Most Salty
        </p>
        <div
          className={
            canScroll ? 'slidebar-content' : 'slidebar-content-inactive'
          }
          ref={containerRef}
          onClick={handleClickContainer}
        >
          <div className='dashes'>
            {dashes.map((num) => {
              const revealedCard = revealedRanks.find((r) => r.rank === num);
              const isRevealed = !!revealedCard;

              return (
                <div
                  key={num}
                  className='dash-container'
                  style={{
                    bottom:
                      num === 0
                        ? '0%'
                        : `${((rangeOfQuiz + 1 - num) / rangeOfQuiz) * 100}%`,
                  }}
                >
                  <svg
                    className={`dash-svg ${isRevealed ? 'revealed-dash' : ''}`}
                  >
                    {isRevealed ? (
                      <Tooltip
                        style={{ zIndex: 50 }}
                        slotProps={{
                          popper: {
                            style: { zIndex: 50 + '!important' },
                          },
                        }}
                        title={
                          <>
                            <img
                              src={revealedCard.imageUrl}
                              alt='Revealed card'
                              className='tooltip-image'
                              onClick={() =>
                                setFullScreenImage(revealedCard.imageUrl)
                              }
                            />
                            <div className='tooltip-image-text-container'>
                              <p className='tooltip-image-text'>
                                {revealedCard.name}
                              </p>
                              <p className='tooltip-text'>
                                Rank: {revealedCard.rank}
                              </p>
                            </div>
                          </>
                        }
                        enterDelay={200}
                        leaveDelay={200}
                        placement='right'
                      >
                        <line
                          x1='10'
                          x2={num === currentGuess ? '30' : '20'}
                          y1='5'
                          y2='5'
                          stroke='var(--clr-accent)'
                          strokeWidth={8}
                          strokeLinecap='round'
                        />
                      </Tooltip>
                    ) : (
                      <line
                        x1='10'
                        x2={num === currentGuess ? '30' : '20'}
                        y1='5'
                        y2='5'
                        stroke='var(--clr-light)'
                        strokeWidth={
                          num === 0
                            ? 1
                            : num === 1 ||
                              num % (rangeOfQuiz === 100 ? 10 : 5) === 0
                            ? 2
                            : num === currentGuess
                            ? 2
                            : 1
                        }
                      />
                    )}
                  </svg>
                  {num === 0 ? (
                    <span className='dash-label'>Ø</span>
                  ) : num === 1 ? (
                    <span className='dash-label'>1</span>
                  ) : num % (rangeOfQuiz === 100 ? 10 : 5) === 0 &&
                    num !== 100 ? (
                    <span className='dash-label'>{num}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
          <svg
            className={canScroll ? 'thumb orange-glow' : 'thumb-inactive'}
            style={{
              bottom:
                currentGuess === 0
                  ? '0%'
                  : `${
                      ((rangeOfQuiz + 1 - currentGuess) / rangeOfQuiz) * 100
                    }%`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setDragging(false)}
            onTouchCancel={() => setDragging(false)}
            width='24'
            height='24'
            viewBox='0 0 24 24'
          >
            <PinIcon
              className={
                !canScroll
                  ? 'pin-icon-inactive'
                  : currentGuess === 0
                  ? 'pin-icon-zero'
                  : 'pin-icon-orange'
              }
            />
          </svg>
        </div>
        <p className={canScroll ? 'slidebar-label' : 'slidebar-label-inactive'}>
          Least Salty
        </p>
        {showPointerHint && !hasGuessed && <PointIcon className='point-icon' />}
      </div>
    </>
  );
};

export default SlideBar;
