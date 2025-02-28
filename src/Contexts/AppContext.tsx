import { createContext, ReactNode, useState } from 'react';
import SaltData from 'Utilities/SaltData.json';

export interface Face {
  name: string;
  imgs: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
}

export interface Card {
  rank: number | null;
  salt_score: number | null;
  card: {
    front: Face;
    back?: Face;
  };
}

interface ScoreDetail {
  cardRank: number;
  guess: number;
  diff: number;
}

interface AppContextType {
  cardData: Card[];
  setCardData: React.Dispatch<React.SetStateAction<Card[]>>;
  selectedCards: Card[];
  setSelectedCards: React.Dispatch<React.SetStateAction<Card[]>>;

  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  userGuess: string;
  setUserGuess: React.Dispatch<React.SetStateAction<string>>;
  scores: ScoreDetail[];
  setScores: React.Dispatch<React.SetStateAction<ScoreDetail[]>>;

  started: boolean;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
  finished: boolean;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [cardData, setCardData] = useState<Card[]>(SaltData);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [scores, setScores] = useState<ScoreDetail[]>([]);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        cardData,
        setCardData,
        selectedCards,
        setSelectedCards,

        currentIndex,
        setCurrentIndex,
        userGuess,
        setUserGuess,
        scores,
        setScores,

        started,
        setStarted,
        finished,
        setFinished,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
