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

interface AppContextType {
  cardData: Card[];
  setCardData: React.Dispatch<React.SetStateAction<Card[]>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [cardData, setCardData] = useState<Card[]>(SaltData);

  return (
    <AppContext.Provider
      value={{
        cardData,
        setCardData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
