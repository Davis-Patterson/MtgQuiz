import React, { useContext } from 'react';
import { AppContext } from 'Contexts/AppContext';
import 'Styles/Main/FullScreen.css';

const FullScreen: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { fullScreenImage, setfullScreenImage } = context;

  if (!fullScreenImage) return null;

  return (
    <div
      className='fullscreen-overlay'
      onClick={() => setfullScreenImage(null)}
    >
      <div className='fullscreen-content'>
        <button
          className='close-button'
          onClick={() => setfullScreenImage(null)}
        >
          ×
        </button>
        <img
          src={fullScreenImage}
          alt='Fullscreen card'
          className='fullscreen-image'
          onClick={() => setfullScreenImage(null)}
        />
      </div>
    </div>
  );
};

export default FullScreen;
