import React, { useContext } from 'react';
import { AppContext } from 'Contexts/AppContext';
import 'Styles/Main/FullScreen.css';

const FullScreen: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { fullscreenImage, setFullscreenImage } = context;

  if (!fullscreenImage) return null;

  return (
    <div
      className='fullscreen-overlay'
      onClick={() => setFullscreenImage(null)}
    >
      <div className='fullscreen-content'>
        <button
          className='close-button'
          onClick={() => setFullscreenImage(null)}
        >
          ×
        </button>
        <img
          src={fullscreenImage}
          alt='Fullscreen card'
          className='fullscreen-image'
          onClick={() => setFullscreenImage(null)}
        />
      </div>
    </div>
  );
};

export default FullScreen;
