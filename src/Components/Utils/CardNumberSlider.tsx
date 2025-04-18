import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from 'Contexts/AppContext';
import ResetIcon from 'Svgs/ResetIcon';
import VerticalPin from 'Svgs/VerticalPin';
import Tooltip from '@mui/material/Tooltip';
import 'Styles/Utils/CardNumberSlider.css';

const CardNumberSlider: React.FC = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('No Context');
  }
  const { gameMode, numberOfCards, setNumberOfCards, creatorQuiz } = appContext;
  const [resetButtonActive, setResetButtonActive] = useState(false);

  const maxCards = gameMode === 'shift' ? 80 : 100;
  const defaultCards = 10;

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const handleNumberOfCardsInput = (rawValue: string) => {
    let numericValue = rawValue.replace(/[^0-9]/g, '');

    if (numericValue.length > 1 && numericValue.startsWith('0')) {
      numericValue = numericValue.slice(1);
    }

    const parsedValue = numericValue ? parseInt(numericValue, 10) : 1;
    const clampedValue = Math.min(maxCards, Math.max(1, parsedValue));

    setNumberOfCards(clampedValue);
  };

  const updateSliderValue = (clientX: number) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      let newValue = Math.round(
        ((clientX - rect.left) / rect.width) * (maxCards - 1) + 1
      );
      newValue = Math.max(1, Math.min(maxCards, newValue));
      setNumberOfCards(newValue);
    }
  };

  const handleSliderClick = (event: React.MouseEvent) => {
    if (isDragging.current) return;
    updateSliderValue(event.clientX);
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragMove = (event: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    updateSliderValue(clientX);
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const handleReset = () => {
    setNumberOfCards(defaultCards);
  };

  useEffect(() => {
    const numberOfCardsDefault = numberOfCards === defaultCards;

    setResetButtonActive(!numberOfCardsDefault);
  }, [numberOfCards, defaultCards]);

  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  return (
    <>
      {creatorQuiz ? (
        <div className='settings-card-number-container disabled'>
          <div className='settings-card-number-display-container'>
            <div className='reset-icon-placeholder' />
            <Tooltip
              title={
                creatorQuiz ? (
                  <>
                    <div className='tooltip-text-container'>
                      <p className='tooltip-text'>Disabled while creator</p>
                      <p className='tooltip-text'>quiz is selected</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='tooltip-text-container'>
                      <p className='tooltip-text'>Reset quiz length to</p>
                      <p className='tooltip-text'>the default of 10</p>
                    </div>
                  </>
                )
              }
              enterDelay={400}
              placement='top'
            >
              <input
                className='settings-slider-value-display'
                value={numberOfCards}
                type='text'
                inputMode='numeric'
                disabled={!!creatorQuiz}
              />
            </Tooltip>
            <Tooltip
              title={
                <>
                  <div className='tooltip-text-container'>
                    <p className='tooltip-text'>Reset quiz length to</p>
                    <p className='tooltip-text'>the default of 10</p>
                  </div>
                </>
              }
              enterDelay={400}
              placement='top'
            >
              <span>
                <div className='reset-icon-container-inactive'>
                  <ResetIcon className='reset-icon-inactive' />
                </div>
              </span>
            </Tooltip>
          </div>
          <Tooltip
            title={
              creatorQuiz ? (
                <>
                  <div className='tooltip-text-container'>
                    <p className='tooltip-text'>Disabled while creator</p>
                    <p className='tooltip-text'>quiz is selected</p>
                  </div>
                </>
              ) : (
                <>
                  <div className='tooltip-text-container'>
                    <p className='tooltip-text'>Reset quiz length to</p>
                    <p className='tooltip-text'>the default of 10</p>
                  </div>
                </>
              )
            }
            enterDelay={400}
            placement='top'
          >
            <div className='settings-slider-wrapper inactive' ref={sliderRef}>
              <div
                className='settings-slider-indicator disabled'
                style={{
                  left: `${((numberOfCards - 0.5) / maxCards) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <VerticalPin className='card-number-pin-icon-orange disabled' />
              </div>
              <div className='settings-dash-container'>
                {Array.from({ length: maxCards }).map((_, index) => {
                  const isTall = (index + 1) % 10 === 0 || index === 0;
                  const currentDash = index === numberOfCards - 1;
                  const shouldLabel =
                    index === 0 || index === 9 || index === maxCards - 1;

                  return (
                    <div key={index} className='settings-dash-item'>
                      <svg
                        width='100%'
                        height='18'
                        className={`settings-dash-svg ${
                          currentDash ? 'current-dash' : ''
                        }`}
                      >
                        <line
                          x1='50%'
                          x2='50%'
                          y1={isTall ? '5' : '10'}
                          y2='18'
                        />
                      </svg>
                      {shouldLabel && (
                        <div
                          className={`settings-dash-label ${
                            index === maxCards - 1 ? 'last' : ''
                          }`}
                        >
                          {index === 9 ? 10 : index + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Tooltip>
        </div>
      ) : (
        <div className='settings-card-number-container'>
          <div className='settings-card-number-display-container'>
            <div className='reset-icon-placeholder' />
            <input
              className='settings-slider-value-display'
              value={numberOfCards}
              type='text'
              inputMode='numeric'
              onChange={(e) => handleNumberOfCardsInput(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
            <Tooltip
              title={
                <>
                  <div className='tooltip-text-container'>
                    <p className='tooltip-text'>Reset quiz length to</p>
                    <p className='tooltip-text'>the default of 10</p>
                  </div>
                </>
              }
              enterDelay={400}
              placement='top'
            >
              <span>
                {resetButtonActive ? (
                  <div
                    className='reset-icon-container'
                    onClick={() => handleReset()}
                  >
                    <ResetIcon className='reset-icon' />
                  </div>
                ) : (
                  <div className='reset-icon-container-inactive'>
                    <ResetIcon className='reset-icon-inactive' />
                  </div>
                )}
              </span>
            </Tooltip>
          </div>
          <div
            className='settings-slider-wrapper'
            ref={sliderRef}
            onClick={handleSliderClick}
          >
            <div
              className='settings-slider-indicator'
              style={{
                left: `${((numberOfCards - 0.5) / maxCards) * 100}%`,
                transform: 'translateX(-50%)',
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <VerticalPin className='card-number-pin-icon-orange' />
            </div>
            <div className='settings-dash-container'>
              {Array.from({ length: maxCards }).map((_, index) => {
                const isTall = (index + 1) % 10 === 0 || index === 0;
                const currentDash = index === numberOfCards - 1;
                const shouldLabel =
                  index === 0 || index === 9 || index === maxCards - 1;

                return (
                  <div key={index} className='settings-dash-item'>
                    <svg
                      width='100%'
                      height='18'
                      className={`settings-dash-svg ${
                        currentDash ? 'current-dash' : ''
                      }`}
                    >
                      <line
                        x1='50%'
                        x2='50%'
                        y1={isTall ? '5' : '10'}
                        y2='18'
                      />
                    </svg>
                    {shouldLabel && (
                      <div
                        className={`settings-dash-label ${
                          index === maxCards - 1 ? 'last' : ''
                        }`}
                      >
                        {index === 9 ? 10 : index + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardNumberSlider;
