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

interface RevealedCard {
  rank: number;
  name: string;
  imageUrl: string;
}

interface AppContextType {
  cardData: Card[];
  setCardData: React.Dispatch<React.SetStateAction<Card[]>>;
  selectedCards: Card[];
  setSelectedCards: React.Dispatch<React.SetStateAction<Card[]>>;

  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  userGuess: number;
  setUserGuess: React.Dispatch<React.SetStateAction<number>>;
  scores: ScoreDetail[];
  setScores: React.Dispatch<React.SetStateAction<ScoreDetail[]>>;
  revealedRanks: RevealedCard[];
  setRevealedRanks: React.Dispatch<React.SetStateAction<RevealedCard[]>>;

  started: boolean;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
  finished: boolean;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
  canScroll: boolean;
  setCanScroll: React.Dispatch<React.SetStateAction<boolean>>;

  shouldFlip: boolean;
  setShouldFlip: React.Dispatch<React.SetStateAction<boolean>>;
  fullScreenImage: string | null;
  setfullScreenImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [cardData, setCardData] = useState<Card[]>(SaltData);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuess, setUserGuess] = useState(0);
  const [scores, setScores] = useState<ScoreDetail[]>([]);
  const [revealedRanks, setRevealedRanks] = useState<RevealedCard[]>([]);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [canScroll, setCanScroll] = useState(true);

  const [shouldFlip, setShouldFlip] = useState(false);
  const [fullScreenImage, setfullScreenImage] = useState<string | null>(null);

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
        revealedRanks,
        setRevealedRanks,

        started,
        setStarted,
        finished,
        setFinished,
        canScroll,
        setCanScroll,

        shouldFlip,
        setShouldFlip,
        fullScreenImage,
        setfullScreenImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
