import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'Styles/Main/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='start-screen'>
      <h1>Welcome to the Salt Quiz!</h1>
      <p>
        In this game, you'll be shown 10 random cards from the top 100 saltiest
        cards. For each card, you must guess its ranking between 1 and 100. Your
        score for each card is the absolute difference between your guess and
        the card's actual rank. Try to get as close as possible!
      </p>
      <button onClick={() => navigate('/salt')}>Start Game</button>
    </div>
  );
};

export default Home;
