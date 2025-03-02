import { useContext } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { Routes, Route } from 'react-router-dom';
import Home from 'Components/Main/Home';
import FullScreen from 'Components/Main/FullScreen';
import Quiz from 'Components/Main/Quiz';
import 'Styles/Main/App.css';

function App() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {} = context;

  return (
    <>
      <FullScreen />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/salt' element={<Quiz />} />
      </Routes>
    </>
  );
}

export default App;
