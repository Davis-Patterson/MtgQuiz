import React, { useContext, useEffect, useState } from 'react';
import { AppContext, Card, RevealedCard } from 'Contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import UserScore from 'Components/Utils/UserScore';
import CardDisplay from 'Components/Utils/CardDisplay';
import SlideBar from 'Components/Utils/SlideBar';
import 'Styles/Main/Quiz.css';

const Quiz: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context available');
  }
  const {
    players,
    setPlayers,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    currentCardGuesses,
    setCurrentCardGuesses,
    currentCardStats,
    setCurrentCardStats,
    cardData,
    setCardStats,
    selectedCards,
    setSelectedCards,
    numberOfCards,
    setNumberOfCards,
    rangeOfQuiz,
    currentIndex,
    setCurrentIndex,
    setRevealedRanks,
    excludedRanks,
    includedRanks,
    creatorRanks,
    setPreviousQuizRanks,
    started,
    setStarted,
    isSubmitted,
    setIsSubmitted,
    finished,
    setFinished,
    setCanScroll,
    setShouldFlip,
  } = context;

  const [currentBackground, setCurrentBackground] = useState<string | null>(
    null
  );
  const [nextBackground, setNextBackground] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [guessButtonActive, setGuessButtonActive] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const currentCard = selectedCards[currentIndex];
  const navigate = useNavigate();

  const gapLimit = 0.18;

  const shuffleCards = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const hasSequentialViolation = (
    selected: Card[],
    maxSequentialPairs: number
  ): boolean => {
    const ranks = selected
      .map((c) => c.rank!)
      .filter((rank) => rank !== null)
      .sort((a, b) => a - b);

    let sequentialPairs = 0;
    let currentSequenceLength = 1;

    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] === ranks[i - 1] + 1) {
        currentSequenceLength++;
        if (currentSequenceLength === 2) {
          sequentialPairs++;
        } else if (currentSequenceLength > 2) {
          return true;
        }
      } else {
        currentSequenceLength = 1;
      }
    }
    return sequentialPairs > maxSequentialPairs;
  };

  const hasRangeClusterViolation = (
    selected: Card[],
    maxCardsPerWindow: number
  ): boolean => {
    const ranks = selected.map((c) => c.rank!).sort((a, b) => a - b);
    const windowSize = 10;

    for (let i = 0; i < ranks.length; i++) {
      let count = 1;
      for (let j = i + 1; j < ranks.length; j++) {
        if (ranks[j] - ranks[i] <= windowSize) {
          count++;
          if (count > maxCardsPerWindow) {
            return true;
          }
        } else {
          break;
        }
      }
    }
    return false;
  };

  const findBestReplacement = (
    clusterRanks: number[],
    remainingRanks: Set<number>,
    currentSelection: Card[]
  ) => {
    const currentRanks = currentSelection
      .filter((c) => c.rank !== null)
      .map((c) => c.rank!);

    const candidates = Array.from(remainingRanks)
      .filter(
        (rank) =>
          rank !== null &&
          !currentRanks.includes(rank) &&
          currentSelection.some((c) => c.rank === rank)
      )
      .map((rank) => {
        const minDistance = currentRanks.reduce(
          (min, r) => Math.min(min, Math.abs(r - rank)),
          Infinity
        );
        return { rank, score: minDistance };
      });

    if (candidates.length === 0) return null;

    const bestCandidate = candidates.reduce((best, curr) =>
      curr.score > best.score ? curr : best
    );

    const clusterCenter = clusterRanks[Math.floor(clusterRanks.length / 2)];
    const toReplace = clusterRanks.reduce((worst, rank) =>
      Math.abs(rank - clusterCenter) < Math.abs(worst - clusterCenter)
        ? rank
        : worst
    );

    const replacementCard = currentSelection.find(
      (c) => c.rank === bestCandidate.rank
    );
    if (!replacementCard?.rank) return null;

    return {
      toReplace,
      replacement: replacementCard,
    };
  };

  const findBestSequentialReplacement = (
    toReplace: number,
    currentSelection: Card[],
    remainingCards: Card[]
  ): Card | null => {
    const currentRanks = currentSelection.map((c) => c.rank!);

    const replaceableCards = remainingCards.filter(
      (c) => !includedRanks.has(c.rank!)
    );

    return (
      replaceableCards
        .filter((c) => {
          const candidateRank = c.rank!;
          return (
            !currentRanks.includes(candidateRank) &&
            !currentRanks.includes(candidateRank + 1) &&
            !currentRanks.includes(candidateRank - 1)
          );
        })
        .map((c) => ({
          card: c,
          score:
            Math.abs(c.rank! - toReplace) +
            Math.abs(c.rank! - (toReplace + 1)) +
            Math.abs(c.rank! - (toReplace - 1)),
        }))
        .sort((a, b) => b.score - a.score)[0]?.card || null
    );
  };

  const hasLargeGaps = (
    selected: Card[],
    rangeSize: number,
    maxGapSize: number
  ): boolean => {
    if (selected.length < 2) return false;
    const effectiveRange = Math.min(rangeSize, 100);
    const adjustedMaxGap = Math.max(
      maxGapSize,
      Math.ceil(effectiveRange / (numberOfCards + 1))
    );

    const ranks = selected.map((c) => c.rank!).sort((a, b) => a - b);

    if (ranks[0] > adjustedMaxGap) return true;

    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] - ranks[i - 1] > adjustedMaxGap) {
        return true;
      }
    }

    return effectiveRange - ranks[ranks.length - 1] > adjustedMaxGap;
  };

  const findBestGapReplacement = (
    selected: Card[],
    remainingCards: Card[],
    rangeSize: number,
    maxGapSize: number
  ): { toReplace: number; replacement: Card } | null => {
    const ranks = selected.map((c) => c.rank!).sort((a, b) => a - b);
    const gaps: { start: number; end: number; size: number }[] = [];

    if (ranks[0] > maxGapSize) {
      gaps.push({ start: 1, end: ranks[0] - 1, size: ranks[0] - 1 });
    }

    for (let i = 1; i < ranks.length; i++) {
      const gapSize = ranks[i] - ranks[i - 1];
      if (gapSize > maxGapSize) {
        gaps.push({
          start: ranks[i - 1] + 1,
          end: ranks[i] - 1,
          size: gapSize,
        });
      }
    }

    if (rangeSize - ranks[ranks.length - 1] > maxGapSize) {
      gaps.push({
        start: ranks[ranks.length - 1] + 1,
        end: rangeSize,
        size: rangeSize - ranks[ranks.length - 1],
      });
    }

    if (gaps.length === 0) return null;

    const largestGap = gaps.reduce((max, gap) =>
      gap.size > max.size ? gap : max
    );

    const gapCandidates = remainingCards.filter(
      (c) => c.rank! >= largestGap.start && c.rank! <= largestGap.end
    );

    if (gapCandidates.length === 0) {
      const replaceable = selected.filter(
        (c) =>
          !includedRanks.has(c.rank!) &&
          selected.filter((other) => Math.abs(c.rank! - other.rank!) <= 10)
            .length < 2
      );

      if (replaceable.length === 0) return null;
      const fallbackCandidate = remainingCards
        .sort(() => Math.random() - 0.5)
        .find((c) => !includedRanks.has(c.rank!));
      if (!fallbackCandidate) return null;

      const replacementTarget = selected.sort((a, b) => {
        const aNeighbors = selected.filter(
          (c) => Math.abs(c.rank! - a.rank!) <= 10
        ).length;
        const bNeighbors = selected.filter(
          (c) => Math.abs(c.rank! - b.rank!) <= 10
        ).length;
        return bNeighbors - aNeighbors;
      })[0];

      return {
        toReplace: replacementTarget.rank!,
        replacement: fallbackCandidate,
      };
    }

    const replaceableCards = selected.filter(
      (c) => !includedRanks.has(c.rank!)
    );

    const clusterScores = replaceableCards.map((c) => ({
      card: c,
      score: selected.reduce(
        (sum, other) => sum + (Math.abs(c.rank! - other.rank!) <= 10 ? 1 : 0),
        0
      ),
    }));

    const mostClustered = clusterScores.reduce((max, curr) =>
      curr.score > max.score ? curr : max
    );

    const bestReplacement = gapCandidates
      .map((c) => {
        const positionInGap = c.rank! - largestGap.start;
        const normalizedPosition = positionInGap / largestGap.size;
        const distanceFromIdeal = Math.abs(normalizedPosition - 0.5);
        return {
          card: c,
          score: 1 - distanceFromIdeal + Math.random() * 0.2,
        };
      })
      .sort((a, b) => b.score - a.score)[0]?.card;

    if (!bestReplacement) return null;

    return {
      toReplace: mostClustered.card.rank!,
      replacement: bestReplacement,
    };
  };

  const calculateDistributionScore = (cards: Card[]) => {
    const ranks = cards.map((c) => c.rank!).sort((a, b) => a - b);
    let score = 0;

    for (let i = 1; i < ranks.length; i++) {
      const gap = ranks[i] - ranks[i - 1];
      score += Math.pow(gap, 2);
    }

    return score;
  };

  const enforceConstraints = (
    selected: Card[],
    remaining: Card[],
    windowSize: number = 10,
    initialMaxSequentialPairs: number = 0,
    initialMaxCardsPerWindow: number = 2
  ): Card[] => {
    let modifiedSelected = [...selected];
    let modifiedRemaining = [...remaining];
    let maxAttempts = 500;
    let attempts = 0;
    const maxGapSize = Math.floor(rangeOfQuiz * gapLimit);

    const remainingRanks = new Set(
      modifiedRemaining.filter((c) => c.rank !== null).map((c) => c.rank!)
    );

    while (attempts < maxAttempts) {
      const previousState = JSON.stringify(modifiedSelected);
      const hasSeq = hasSequentialViolation(
        modifiedSelected,
        initialMaxSequentialPairs
      );
      const hasRange = hasRangeClusterViolation(
        modifiedSelected,
        initialMaxCardsPerWindow
      );
      const hasGaps = hasLargeGaps(modifiedSelected, rangeOfQuiz, maxGapSize);

      if (!hasSeq && !hasRange && !hasGaps) break;

      if (hasGaps) {
        const gapReplacement = findBestGapReplacement(
          modifiedSelected,
          modifiedRemaining,
          rangeOfQuiz,
          maxGapSize
        );

        if (gapReplacement) {
          if (includedRanks.has(gapReplacement.toReplace)) {
            attempts++;
            continue;
          }
          const indexToReplace = modifiedSelected.findIndex(
            (c) => c.rank === gapReplacement.toReplace
          );

          modifiedSelected[indexToReplace] = gapReplacement.replacement;
          modifiedRemaining = modifiedRemaining.filter(
            (c) => c.rank !== gapReplacement.replacement.rank
          );
          modifiedRemaining.push(modifiedSelected[indexToReplace]);
          attempts++;
          continue;
        }
      }

      if (hasSeq) {
        const ranks = modifiedSelected
          .map((c) => c.rank!)
          .sort((a, b) => a - b);
        let seqIndex = -1;

        for (let i = 1; i < ranks.length; i++) {
          if (ranks[i] === ranks[i - 1] + 1) {
            seqIndex = i - 1;
            break;
          }
        }

        if (seqIndex !== -1) {
          const toReplace = ranks[seqIndex];
          const bestReplacement = findBestSequentialReplacement(
            toReplace,
            modifiedSelected,
            modifiedRemaining
          );

          if (bestReplacement) {
            if (includedRanks.has(toReplace)) {
              attempts++;
              continue;
            }
            const indexToReplace = modifiedSelected.findIndex(
              (c) => c.rank === toReplace
            );
            modifiedSelected[indexToReplace] = bestReplacement;
            modifiedRemaining = modifiedRemaining.filter(
              (c) => c.rank !== bestReplacement.rank
            );
            modifiedRemaining.push(modifiedSelected[indexToReplace]);
            attempts++;
            continue;
          }
        }
      }

      if (hasRange) {
        const ranks = modifiedSelected
          .map((c) => c.rank!)
          .sort((a, b) => a - b);
        let maxCluster = { start: 0, end: 0, count: 0 };

        for (let i = 0; i < ranks.length; i++) {
          let j = i;
          while (ranks[j] - ranks[i] <= windowSize && j < ranks.length) j++;
          if (j - i > maxCluster.count) {
            maxCluster = { start: i, end: j - 1, count: j - i };
          }
        }

        if (maxCluster.count > 0) {
          const clusterRanks = ranks.slice(
            maxCluster.start,
            maxCluster.end + 1
          );
          const bestReplacement = findBestReplacement(
            clusterRanks,
            remainingRanks,
            modifiedSelected
          );

          if (bestReplacement?.replacement && bestReplacement?.toReplace) {
            const indexToReplace = modifiedSelected.findIndex(
              (c) => c.rank === bestReplacement.toReplace
            );

            if (indexToReplace === -1) break;
            if (!bestReplacement.replacement.rank) break;

            modifiedSelected[indexToReplace] = bestReplacement.replacement;
            modifiedRemaining = modifiedRemaining.filter(
              (c) => c.rank !== bestReplacement.replacement.rank
            );
            modifiedRemaining.push(modifiedSelected[indexToReplace]);
          } else {
            break;
          }
        }
      }
      if (JSON.stringify(modifiedSelected) === previousState) {
        attempts++;
      } else {
        attempts = 0;
      }

      if (attempts > 50) break;

      attempts++;
    }
    return modifiedSelected;
  };

  useEffect(() => {
    if (!started) {
      let selected: Card[] = [];
      let finalNumberOfCards = numberOfCards;

      if (creatorRanks.size > 0) {
        const creatorCards = Array.from(creatorRanks)
          .map((rank) => cardData.find((c) => c.rank === rank))
          .filter((card): card is Card => !!card);

        selected = creatorCards;
        finalNumberOfCards = creatorCards.length;
        setNumberOfCards(creatorCards.length);
      } else if (includedRanks.size > 0) {
        const validIncludedCards = Array.from(includedRanks)
          .map((rank) =>
            cardData.find(
              (c) =>
                c.rank === rank &&
                !excludedRanks.has(rank) &&
                c.rank <= rangeOfQuiz
            )
          )
          .filter((card): card is Card => !!card);

        const shuffledIncluded = shuffleCards(validIncludedCards);
        const neededCards = finalNumberOfCards - shuffledIncluded.length;

        if (neededCards > 0) {
          const remainingValidCards = cardData.filter(
            (card) =>
              card.rank !== null &&
              card.salt_score !== null &&
              !excludedRanks.has(card.rank) &&
              !includedRanks.has(card.rank) &&
              card.rank <= rangeOfQuiz
          );

          const additionalCards = shuffleCards(remainingValidCards).slice(
            0,
            neededCards
          );
          selected = shuffleCards([...shuffledIncluded, ...additionalCards]);
        } else {
          selected = shuffledIncluded.slice(0, finalNumberOfCards);
        }
      } else {
        const validCards = cardData.filter(
          (card) =>
            card.rank !== null &&
            card.salt_score !== null &&
            !excludedRanks.has(card.rank) &&
            card.rank <= rangeOfQuiz
        );
        selected = shuffleCards(validCards).slice(0, finalNumberOfCards);
      }

      if (creatorRanks.size === 0 && includedRanks.size < finalNumberOfCards) {
        const remainingValidCards = cardData.filter(
          (card) =>
            card.rank !== null &&
            card.salt_score !== null &&
            !excludedRanks.has(card.rank) &&
            !selected.some((c) => c.rank === card.rank) &&
            card.rank <= rangeOfQuiz
        );

        if (remainingValidCards.length > 0) {
          try {
            const originalScore = calculateDistributionScore(selected);
            const modified = enforceConstraints(
              selected.filter((c) => c.rank !== null),
              remainingValidCards,
              10,
              0,
              2
            );
            const optimizedScore = calculateDistributionScore(modified);

            if (optimizedScore < originalScore * 0.9) {
              selected = modified;
            }

            selected = shuffleCards([
              ...selected.filter((c) => includedRanks.has(c.rank!)),
              ...selected.filter((c) => !includedRanks.has(c.rank!)),
            ]);
          } catch (e) {
            console.error(
              'Constraint enforcement failed, using fallback selection'
            );
            selected = shuffleCards(selected);
          }
        }
      }

      if (selected.length < finalNumberOfCards) {
        const fallbackCards = cardData.filter(
          (card) =>
            card.rank !== null &&
            !selected.some((c) => c.rank === card.rank) &&
            card.rank <= rangeOfQuiz
        );
        selected = shuffleCards([...selected, ...fallbackCards]).slice(
          0,
          finalNumberOfCards
        );
      }

      const initialRevealed = Array.from(excludedRanks)
        .map((rank) => {
          const card = cardData.find((c) => c.rank === rank);
          return card
            ? {
                rank: card.rank,
                name: card.card.front.name,
                imageUrl: card.card.front.imgs.normal,
              }
            : null;
        })
        .filter(Boolean) as RevealedCard[];

      setRevealedRanks(initialRevealed);
      setSelectedCards(selected);
      setCurrentIndex(0);
      setCurrentCardGuesses({});
      setFinished(false);
      setStarted(true);
    }
  }, [
    started,
    cardData,
    rangeOfQuiz,
    excludedRanks,
    includedRanks,
    creatorRanks,
    setRevealedRanks,
    setSelectedCards,
    setStarted,
    numberOfCards,
    setNumberOfCards,
  ]);

  useEffect(() => {
    if (finished) {
      navigate('/results');
    }
  }, [finished]);

  useEffect(() => {
    if (selectedCards.length > 0 && currentIndex >= 0) {
      const artCropUrl = currentCard.card.front.imgs.art_crop;

      if (!currentBackground) {
        setCurrentBackground(artCropUrl);
      } else {
        setNextBackground(artCropUrl);
        setIsTransitioning(true);
      }
    }
  }, [currentIndex, selectedCards]);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setCurrentBackground(nextBackground);
        setNextBackground(null);
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, nextBackground]);

  useEffect(() => {
    if (cardData && cardData.length > 0) {
      const randomIndex = Math.floor(Math.random() * cardData.length);
      const artCropUrl = cardData[randomIndex].card.front.imgs.art_crop;
      setBackgroundImage(artCropUrl);
    }
  }, [cardData]);

  useEffect(() => {
    if (selectedCards.length === 0) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedCards]);

  useEffect(() => {
    const currentGuess = currentCardGuesses[currentPlayer.order];
    if (
      typeof currentGuess === 'number' &&
      currentGuess > 0 &&
      currentGuess <= rangeOfQuiz
    ) {
      setGuessButtonActive(true);
    } else {
      setGuessButtonActive(false);
    }
  }, [currentCardGuesses, currentPlayer.order, rangeOfQuiz]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentGuess = currentCardGuesses[currentPlayer.order];
    if (typeof currentGuess !== 'number' || isNaN(currentGuess)) return;

    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else {
      processCardResults();
      setIsSubmitted(true);
      setCanScroll(false);
    }
  };

  const processCardResults = () => {
    const currentCard = selectedCards[currentIndex];
    if (!currentCard?.rank) return;

    const cardRank = currentCard.rank;
    const guesses = Object.values(currentCardGuesses);

    if (guesses.length !== players.length) {
      console.error('Missing guesses for some players');
      return;
    }

    const avgGuess = guesses.reduce((a, b) => a + b, 0) / guesses.length;

    setCurrentCardStats({
      cardRank,
      averageGuess: avgGuess,
    });

    if (currentCard.card?.front?.imgs?.normal) {
      const revealedCard = {
        rank: cardRank,
        name: currentCard.card.front.name,
        imageUrl: currentCard.card.front.imgs.normal,
      };
      setRevealedRanks((prev) => [...prev, revealedCard]);
    }
  };

  const handleNext = () => {
    if (!currentCardStats) return;

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        scores: [
          ...player.scores,
          {
            cardRank: currentCardStats.cardRank,
            guess: currentCardGuesses[player.order],
            diff: Math.abs(
              currentCardStats.cardRank - currentCardGuesses[player.order]
            ),
          },
        ],
      }))
    );

    setCardStats((prev) => [...prev, currentCardStats]);
    setCurrentCardGuesses({});
    setCurrentCardStats(null);
    setCurrentPlayerIndex(0);
    setIsSubmitted(false);
    setCanScroll(true);

    if (currentIndex < selectedCards.length - 1) {
      setShouldFlip(true);
      setTimeout(() => {
        setShouldFlip(false);
        setCurrentIndex(currentIndex + 1);
      }, 300);
    } else {
      const quizRanks = new Set([
        ...excludedRanks,
        ...(selectedCards.map((card) => card.rank).filter(Boolean) as number[]),
      ]);
      setPreviousQuizRanks(quizRanks);
      setFinished(true);
    }
  };

  const handleGuessInput = (rawValue: string) => {
    const numericValue = rawValue.replace(/[^0-9]/g, '');
    let sanitizedValue = numericValue;

    if (numericValue.startsWith('0') && numericValue.length > 1) {
      sanitizedValue = numericValue.slice(1);
    }

    const parsedValue = parseInt(sanitizedValue) || 0;
    const clampedValue = Math.min(100, Math.max(0, parsedValue));

    setCurrentCardGuesses((prev) => ({
      ...prev,
      [currentPlayer.order]: clampedValue,
    }));
  };

  const calculateTotalScore = (player: (typeof players)[0]) => {
    const historicalTotal = player.scores.reduce(
      (sum, score) => sum + score.diff,
      0
    );
    const currentGuess = currentCardGuesses[player.order] || 0;
    const currentDiff = currentCardStats
      ? Math.abs(currentCardStats.cardRank - currentGuess)
      : 0;

    return historicalTotal + (isSubmitted ? currentDiff : 0);
  };

  if (selectedCards.length === 0) {
    return (
      <>
        <div className='page-container'>
          {backgroundImage && (
            <>
              <div
                className='background-img'
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
              <div className='background-overlay' />
            </>
          )}
          <div className='not-found shadow-glow'>
            <div className='quiz-not-found-header'>
              <div className='quiz-not-found-header-text-container'>
                <h1 className='quiz-not-found-header-text'>404: No Data</h1>
              </div>
              <div className='quiz-not-found-header-subtext-container'>
                <p className='quiz-not-found-header-subtext'>
                  We could not start the quiz, please try again.
                </p>
                <p className='quiz-not-found-header-subtext'>
                  Redirecting to homepage...
                </p>
              </div>
            </div>
            <div className='quiz-not-found-content-container'></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className='page-container'>
        <div className='background-container'>
          {currentBackground && (
            <div
              className={`transition-background-img ${
                isTransitioning ? 'fade-out' : 'active'
              }`}
              style={{ backgroundImage: `url(${currentBackground})` }}
            />
          )}
          {nextBackground && (
            <div
              className='transition-background-img fade-in'
              style={{ backgroundImage: `url(${nextBackground})` }}
            />
          )}
          <div className='background-overlay' />
        </div>
        <UserScore />
        <div className='quiz-container'>
          <SlideBar />
          <div className='quiz-content'>
            <p className='card-count'>
              Card {currentIndex + 1} of {numberOfCards}
            </p>
            {players.length > 1 &&
              (isSubmitted ? (
                <p className='quiz-current-player-guess'>All players guessed</p>
              ) : (
                <p className='quiz-current-player-guess'>
                  {currentPlayer.name
                    ? `${currentPlayer.name.trim()}'s guess:`
                    : `Player ${currentPlayer.order}'s guess:`}
                </p>
              ))}
            <CardDisplay />
            {isSubmitted ? (
              <>
                {players.length === 1
                  ? currentCardStats && (
                      <div className='breakdown'>
                        <div className='scores-breakdown-container'>
                          <div className='scores-guess-container'>
                            <div className='scores-guess-text-row'>
                              <p className='score-text-label'>Card Rank:</p>
                              <p className='score-text'>
                                {currentCardStats.cardRank}
                              </p>
                            </div>
                            <div className='scores-guess-text-row'>
                              <p className='score-text-label'>Your Guess:</p>
                              <p className='score-text'>
                                {currentCardGuesses[currentPlayer.order]}
                              </p>
                            </div>
                          </div>
                          <div className='scores-score-container'>
                            <p className='score-text-score-label'>Score:</p>
                            <div className='score-text-score-container'>
                              <p className='score-text-plus'>+</p>
                              <p className='score-text-score'>
                                {Math.abs(
                                  currentCardStats.cardRank -
                                    currentCardGuesses[currentPlayer.order]
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleNext}
                          className='next-button blue-glow'
                        >
                          {currentIndex < numberOfCards - 1
                            ? 'Next Card'
                            : 'View Results'}
                        </button>
                      </div>
                    )
                  : currentCardStats && (
                      <div className='multi-breakdown'>
                        <div className='multi-breakdown-container'>
                          <div className='card-rank-display'>
                            <div className='multi-score-text-container'>
                              <p className='multi-score-text-label'>
                                Card Rank:
                              </p>
                              {currentCardStats && (
                                <>
                                  <p className='multi-score-text'>
                                    {currentCardStats.cardRank}
                                  </p>
                                </>
                              )}
                            </div>
                            <div className='multi-score-text-container'>
                              {currentCardStats && (
                                <>
                                  <p className='multi-score-average-label'>
                                    Avg Guess:
                                  </p>
                                  <p className='multi-score-average-text'>
                                    {currentCardStats.averageGuess.toFixed(1)}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className='stat-cards-container'>
                            {players.map((player) => {
                              const currentGuess =
                                currentCardGuesses[player.order];
                              return (
                                <>
                                  {players.length === 2 ? (
                                    <div
                                      key={player.id}
                                      className='duo-stat-card'
                                    >
                                      <p className='stat-player-name'>
                                        {player.name ||
                                          `Player ${player.order}`}
                                      </p>
                                      <div className='duo-stat-container'>
                                        <div className='duo-guess-container'>
                                          <p className='stat-player-guess'>
                                            Guess: {currentGuess}
                                          </p>
                                          <p className='stat-player-diff'>
                                            Score: +
                                            {Math.abs(
                                              currentCardStats.cardRank -
                                                currentGuess
                                            )}
                                          </p>
                                        </div>
                                        {currentCardStats && (
                                          <div className='duo-total-container'>
                                            {currentCardStats && (
                                              <>
                                                <p className='stat-player-total-label'>
                                                  Total
                                                </p>
                                                <p className='stat-player-total'>
                                                  {calculateTotalScore(player)}
                                                </p>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div key={player.id} className='stat-card'>
                                      <p className='stat-player-name'>
                                        {player.name ||
                                          `Player ${player.order}`}
                                      </p>
                                      <p className='stat-player-guess'>
                                        Guess: {currentGuess}
                                      </p>
                                      {currentCardStats && (
                                        <p className='stat-player-diff'>
                                          Score: +
                                          {Math.abs(
                                            currentCardStats.cardRank -
                                              currentGuess
                                          )}
                                        </p>
                                      )}
                                      {currentCardStats && (
                                        <p className='stat-player-diff'>
                                          Total: {calculateTotalScore(player)}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          onClick={handleNext}
                          className='next-button blue-glow'
                        >
                          {currentIndex < selectedCards.length - 1
                            ? 'Next Card'
                            : 'View Results'}
                        </button>
                      </div>
                    )}
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit} className='quiz-form'>
                  <input
                    type='text'
                    className='user-guess'
                    value={
                      currentCardGuesses[currentPlayer.order] === 0
                        ? 'Ø'
                        : currentCardGuesses[currentPlayer.order]?.toString() ||
                          'Ø'
                    }
                    onChange={(e) => handleGuessInput(e.target.value)}
                    onFocus={(e) => {
                      if (currentCardGuesses[currentPlayer.order] === 0) {
                        e.target.value = '';
                      }
                      e.target.select();
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        setCurrentCardGuesses((prev) => ({
                          ...prev,
                          [currentPlayer.order]: 0,
                        }));
                      }
                    }}
                    inputMode='numeric'
                    style={{
                      color: !guessButtonActive
                        ? 'var(--clr-divider)'
                        : 'inherit',
                    }}
                  />
                  <button
                    type='submit'
                    className={
                      guessButtonActive
                        ? 'guess-button orange-glow'
                        : 'inactive-button'
                    }
                    disabled={!guessButtonActive}
                  >
                    <p className='quiz-button-text'>
                      {currentPlayer.name
                        ? `Submit ${currentPlayer.name}`
                        : `Submit Player ${currentPlayer.order}`}
                    </p>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Quiz;
