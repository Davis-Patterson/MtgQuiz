import React, { useContext } from 'react';
import { AppContext } from 'Contexts/AppContext';
import 'Styles/Main/FullScreen.css';

const FullScreen: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { fullScreenImage, setFullScreenImage } = context;

  if (!fullScreenImage) return null;

  return (
    <div
      className='fullscreen-overlay'
      onClick={() => setFullScreenImage(null)}
    >
      <div className='fullscreen-content'>
        <button
          className='close-button'
          onClick={() => setFullScreenImage(null)}
        >
          ×
        </button>
        <div className='image-wrapper'>
          <img
            src={fullScreenImage}
            alt='Fullscreen card'
            className='fullscreen-image'
            onClick={() => setFullScreenImage(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default FullScreen;
