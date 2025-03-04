import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import 'Styles/Tools/NotFound.css';

const NotFound: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { cardData } = context;

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (cardData && cardData.length > 0) {
      const randomIndex = Math.floor(Math.random() * cardData.length);
      const artCropUrl = cardData[randomIndex].card.front.imgs.art_crop;
      setBackgroundImage(artCropUrl);
    }
  }, [cardData]);

  return (
    <>
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
        <div className='not-found shadow-glow'>
          <div className='not-found-header'>
            <div className='not-found-header-text-container'>
              <h1 className='not-found-header-text'>404: Not Found</h1>
            </div>
            <div className='not-found-header-subtext-container'>
              <p className='not-found-header-subtext'>
                The page you're looking for cannot be found.
              </p>
              <p className='not-found-header-subtext'>
                Redirecting to homepage...
              </p>
            </div>
          </div>
          <div className='not-found-content-container'></div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
