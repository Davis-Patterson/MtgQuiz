import { useContext, lazy, Suspense } from 'react';
import { AppContext } from 'Contexts/AppContext';
import { Routes, Route } from 'react-router-dom';
import Home from 'Components/Main/Home';
import Loading from 'Components/Utils/Loading';
import 'Styles/Main/App.css';

const Quiz = lazy(() => import('Components/Main/Quiz'));

function App() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const { isLoading } = context;

  return (
    <>
      {isLoading && <Loading />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/salt'
          element={
            <Suspense fallback={<Loading />}>
              <Quiz />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;
