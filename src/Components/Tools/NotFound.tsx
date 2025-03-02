import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'Styles/Tools/NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className='page-container'>
        <div className='not-found'>
          <div className='not-found-header'>
            <div className='not-found-header-text-container'>
              {/* <AlertIcon className='not-found-alert-left' /> */}
              <h1 className='not-found-header-text'>404: Not Found</h1>
              {/* <AlertIcon className='not-found-alert-right' /> */}
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
