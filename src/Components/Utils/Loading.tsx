import React, { useContext } from 'react';
import { AppContext } from 'Contexts/AppContext';
import 'Styles/Utils/Loading.css';

const Loading: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context');
  }
  const { isLoading } = context;

  return (
    <>
      {isLoading && (
        <div>
          <p>Loading...</p>
        </div>
      )}
    </>
  );
};

export default Loading;
