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

export interface ScoreDetail {
  cardRank: number;
  guess: number;
  diff: number;
}

export interface RevealedCard {
  rank: number;
  name: string;
  imageUrl: string;
}

interface AppContextType {
  cardData: Card[];
  setCardData: React.Dispatch<React.SetStateAction<Card[]>>;
  selectedCards: Card[];
  setSelectedCards: React.Dispatch<React.SetStateAction<Card[]>>;
  numberOfCards: number;
  setNumberOfCards: React.Dispatch<React.SetStateAction<number>>;

  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  userGuess: number;
  setUserGuess: React.Dispatch<React.SetStateAction<number>>;
  scores: ScoreDetail[];
  setScores: React.Dispatch<React.SetStateAction<ScoreDetail[]>>;
  revealedRanks: RevealedCard[];
  setRevealedRanks: React.Dispatch<React.SetStateAction<RevealedCard[]>>;
  selectedRanks: Set<number>;
  setSelectedRanks: React.Dispatch<React.SetStateAction<Set<number>>>;

  started: boolean;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
  finished: boolean;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
  canScroll: boolean;
  setCanScroll: React.Dispatch<React.SetStateAction<boolean>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;

  shouldFlip: boolean;
  setShouldFlip: React.Dispatch<React.SetStateAction<boolean>>;
  fullScreenImage: string | null;
  setFullScreenImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [cardData, setCardData] = useState<Card[]>(SaltData);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [numberOfCards, setNumberOfCards] = useState<number>(0);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userGuess, setUserGuess] = useState<number>(0);
  const [scores, setScores] = useState<ScoreDetail[]>([]);
  const [revealedRanks, setRevealedRanks] = useState<RevealedCard[]>([]);
  const [selectedRanks, setSelectedRanks] = useState<Set<number>>(new Set());

  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [canScroll, setCanScroll] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [shouldFlip, setShouldFlip] = useState<boolean>(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        cardData,
        setCardData,
        selectedCards,
        setSelectedCards,
        numberOfCards,
        setNumberOfCards,

        currentIndex,
        setCurrentIndex,
        userGuess,
        setUserGuess,
        scores,
        setScores,
        revealedRanks,
        setRevealedRanks,
        selectedRanks,
        setSelectedRanks,

        started,
        setStarted,
        finished,
        setFinished,
        canScroll,
        setCanScroll,
        showSettings,
        setShowSettings,

        shouldFlip,
        setShouldFlip,
        fullScreenImage,
        setFullScreenImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
