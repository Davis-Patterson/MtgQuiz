import { createContext, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SaltData from 'Utilities/SaltData.json';

export interface Player {
  id: string;
  order: number;
  name: string;
  scores: ScoreDetail[];
}

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
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  currentPlayerIndex: number;
  setCurrentPlayerIndex: React.Dispatch<React.SetStateAction<number>>;
  currentCardGuesses: Record<string, number>;
  setCurrentCardGuesses: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;

  cardData: Card[];
  setCardData: React.Dispatch<React.SetStateAction<Card[]>>;
  selectedCards: Card[];
  setSelectedCards: React.Dispatch<React.SetStateAction<Card[]>>;
  numberOfCards: number;
  setNumberOfCards: React.Dispatch<React.SetStateAction<number>>;
  rangeOfQuiz: number;
  setRangeOfQuiz: React.Dispatch<React.SetStateAction<number>>;
  creatorQuiz: string;
  setCreatorQuiz: React.Dispatch<React.SetStateAction<string>>;

  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  revealedRanks: RevealedCard[];
  setRevealedRanks: React.Dispatch<React.SetStateAction<RevealedCard[]>>;
  excludedRanks: Set<number>;
  setExcludedRanks: React.Dispatch<React.SetStateAction<Set<number>>>;
  includedRanks: Set<number>;
  setIncludedRanks: React.Dispatch<React.SetStateAction<Set<number>>>;
  creatorRanks: Set<number>;
  setCreatorRanks: React.Dispatch<React.SetStateAction<Set<number>>>;
  previousQuizRanks: Set<number>;
  setPreviousQuizRanks: React.Dispatch<React.SetStateAction<Set<number>>>;

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
  const [players, setPlayers] = useState<Player[]>([
    {
      id: uuidv4(),
      order: 1,
      name: '',
      scores: [],
    },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [currentCardGuesses, setCurrentCardGuesses] = useState<
    Record<string, number>
  >({});

  const [cardData, setCardData] = useState<Card[]>(SaltData);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [numberOfCards, setNumberOfCards] = useState<number>(10);
  const [rangeOfQuiz, setRangeOfQuiz] = useState<number>(100);
  const [creatorQuiz, setCreatorQuiz] = useState<string>('');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [revealedRanks, setRevealedRanks] = useState<RevealedCard[]>([]);
  const [excludedRanks, setExcludedRanks] = useState<Set<number>>(new Set());
  const [includedRanks, setIncludedRanks] = useState<Set<number>>(new Set());
  const [creatorRanks, setCreatorRanks] = useState<Set<number>>(new Set());
  const [previousQuizRanks, setPreviousQuizRanks] = useState<Set<number>>(
    new Set()
  );

  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [canScroll, setCanScroll] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [shouldFlip, setShouldFlip] = useState<boolean>(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        players,
        setPlayers,
        currentPlayerIndex,
        setCurrentPlayerIndex,
        currentCardGuesses,
        setCurrentCardGuesses,

        cardData,
        setCardData,
        selectedCards,
        setSelectedCards,
        numberOfCards,
        setNumberOfCards,
        rangeOfQuiz,
        setRangeOfQuiz,
        creatorQuiz,
        setCreatorQuiz,

        currentIndex,
        setCurrentIndex,
        revealedRanks,
        setRevealedRanks,
        excludedRanks,
        setExcludedRanks,
        includedRanks,
        setIncludedRanks,
        creatorRanks,
        setCreatorRanks,
        previousQuizRanks,
        setPreviousQuizRanks,

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
