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
    userGuess,
    setUserGuess,
    revealedRanks,
    canScroll,
    setfullScreenImage,
  } = context;

  const [dragging, setDragging] = useState(false);
  const [showPointerHint, setShowPointerHint] = useState(false);
  const [hasGuessed, setHasGuessed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dashes = Array.from({ length: 101 }, (_, i) => i);

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

  const updateGuessFromPointer = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const percentage = (1 - offsetY / rect.height) * 100;
    const newGuess = Math.max(0, Math.min(100, Math.round(percentage)));
    setUserGuess(newGuess);
  };

  useEffect(() => {
    if (userGuess > 0) {
      setShowPointerHint(false);
      setHasGuessed(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [userGuess]);

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

  return (
    <>
      <div className='slidebar-container'>
        <p className={canScroll ? 'slidebar-label' : 'slidebar-label-inactive'}>
          Least Salty
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
                  style={{ bottom: `${num}%` }}
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
                                setfullScreenImage(revealedCard.imageUrl)
                              }
                            />
                            <p className='tooltip-text'>{revealedCard.name}</p>
                            <p className='tooltip-text'>
                              Rank: {revealedCard.rank}
                            </p>
                          </>
                        }
                        enterDelay={200}
                        leaveDelay={200}
                        placement='right'
                      >
                        <line
                          x1='10'
                          x2={num === userGuess ? '30' : '20'}
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
                        x2={num === userGuess ? '30' : '20'}
                        y1='5'
                        y2='5'
                        stroke='var(--clr-light)'
                        strokeWidth={
                          num % 10 === 0 ? 2 : num === userGuess ? 2 : 1
                        }
                      />
                    )}
                  </svg>
                  {num % 10 === 0 && <span className='dash-label'>{num}</span>}
                </div>
              );
            })}
          </div>
          <svg
            className={canScroll ? 'thumb orange-glow' : 'thumb-inactive'}
            style={{ bottom: `${userGuess}%` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            width='24'
            height='24'
            viewBox='0 0 24 24'
          >
            <PinIcon
              className={
                !canScroll
                  ? 'pin-icon-inactive'
                  : userGuess === 0
                  ? 'pin-icon-zero'
                  : 'pin-icon-orange'
              }
            />
          </svg>
        </div>
        <p className={canScroll ? 'slidebar-label' : 'slidebar-label-inactive'}>
          Most Salty
        </p>
        {showPointerHint && !hasGuessed && <PointIcon className='point-icon' />}
      </div>
    </>
  );
};

export default SlideBar;
