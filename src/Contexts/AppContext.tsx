import { createContext, ReactNode, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SaltData2024 from 'Utilities/SaltData2024.json';
import SaltData2023 from 'Utilities/SaltData2023.json';

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

export interface CardStat {
  cardRank: number;
  averageGuess: number;
}

export interface RevealedCard {
  rank: number;
  name: string;
  imageUrl: string;
}

interface AppContextType {
  listYearDefault: number;

  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  currentPlayerIndex: number;
  setCurrentPlayerIndex: React.Dispatch<React.SetStateAction<number>>;
  currentCardGuesses: Record<string, number>;
  setCurrentCardGuesses: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  currentCardStats: CardStat | null;
  setCurrentCardStats: React.Dispatch<React.SetStateAction<CardStat | null>>;

  cardData: Card[];
  setCardData: React.Dispatch<React.SetStateAction<Card[]>>;
  listYear: number;
  setListYear: React.Dispatch<React.SetStateAction<number>>;
  cardStats: CardStat[];
  setCardStats: React.Dispatch<React.SetStateAction<CardStat[]>>;
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
  isSubmitted: boolean;
  setIsSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  finished: boolean;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
  canScroll: boolean;
  setCanScroll: React.Dispatch<React.SetStateAction<boolean>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  showSettingsWindow: boolean;
  setShowSettingsWindow: React.Dispatch<React.SetStateAction<boolean>>;
  showContactWindow: boolean;
  setShowContactWindow: React.Dispatch<React.SetStateAction<boolean>>;

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
  const listYearDefault = 2024;

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
  const [currentCardStats, setCurrentCardStats] = useState<CardStat | null>(
    null
  );

  const [cardData, setCardData] = useState<Card[]>([]);
  const [listYear, setListYear] = useState<number>(2024);
  const [cardStats, setCardStats] = useState<CardStat[]>([]);
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
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [canScroll, setCanScroll] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSettingsWindow, setShowSettingsWindow] = useState<boolean>(true);
  const [showContactWindow, setShowContactWindow] = useState<boolean>(false);

  const [shouldFlip, setShouldFlip] = useState<boolean>(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    const yearsMapping: { [key: number]: Card[] } = {
      2024: SaltData2024 as Card[],
      2023: SaltData2023 as Card[],
    };

    const selectedData =
      yearsMapping[listYear] || yearsMapping[listYearDefault];
    setCardData(selectedData);
  }, [listYear]);

  return (
    <AppContext.Provider
      value={{
        listYearDefault,

        players,
        setPlayers,
        currentPlayerIndex,
        setCurrentPlayerIndex,
        currentCardGuesses,
        setCurrentCardGuesses,
        currentCardStats,
        setCurrentCardStats,

        cardData,
        setCardData,
        listYear,
        setListYear,
        cardStats,
        setCardStats,
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
        isSubmitted,
        setIsSubmitted,
        finished,
        setFinished,
        canScroll,
        setCanScroll,
        showSettings,
        setShowSettings,
        showSettingsWindow,
        setShowSettingsWindow,
        showContactWindow,
        setShowContactWindow,

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
