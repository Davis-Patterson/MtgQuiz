// react-app-env.d.ts
declare module '*.json' {
  interface Card {
    rank: number | null;
    salt_score: number | null;
    card: {
      front: {
        name: string;
        imgs: {
          small: string;
          normal: string;
          large: string;
          png: string;
          art_crop: string;
          border_crop: string;
        };
      };
      back?: {
        name: string;
        imgs: {
          small: string;
          normal: string;
          large: string;
          png: string;
          art_crop: string;
          border_crop: string;
        };
      };
    };
  }

  const value: Card[];
  export default value;
}
