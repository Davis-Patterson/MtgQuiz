import { useContext, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import creatorsDataSeason1 from 'Utilities/CGB-Quizzes-Season-1.json';
import 'Styles/Utils/CreatorLeaderboard.css';

function CreatorLeaderboard() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context');
  }

  const [selectedSeason, setSelectedSeason] = useState(1);

  const getSeasonData = (season: number) => {
    switch (season) {
      case 1:
        return [...creatorsDataSeason1];
      default:
        return [...creatorsDataSeason1];
    }
  };

  const currentData = getSeasonData(selectedSeason).sort(
    (a, b) => a.score - b.score
  );

  return (
    <>
      <div className='creator-leaderboard-container'>
        <select
          className='creator-leaderboard-selector'
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
        >
          <option value={1}>Season 1</option>
        </select>

        <div className='creator-leaderboard-rankings'>
          {currentData.map((creator, index) => (
            <div
              className='creator-ranking'
              key={`${creator.creator}-s${selectedSeason}`}
            >
              <span className='ranking-position'>#{index + 1}</span>
              <span className='ranking-name'>{creator.creator}</span>
              <span className='ranking-score'>{creator.score}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default CreatorLeaderboard;
