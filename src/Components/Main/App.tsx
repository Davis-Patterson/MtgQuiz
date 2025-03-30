import { useContext } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { Routes, Route } from 'react-router-dom';
import Home from 'Components/Main/Home';
import FullScreen from 'Components/Main/FullScreen';
import Settings from 'Components/Utils/Settings';
import Quiz from 'Components/Main/Quiz';
import Postgame from 'Components/Main/Postgame';
import NotFound from 'Components/Tools/NotFound';
import 'Styles/Main/App.css';

function App() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {} = context;

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/salt' element={<Quiz />} />
        <Route path='/results' element={<Postgame />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <FullScreen />
      <Settings />
    </>
  );
}

export default App;
