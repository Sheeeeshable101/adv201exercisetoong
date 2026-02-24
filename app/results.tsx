import { ThemedText } from "@/components/themed-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const HIGH_SCORE_KEYS = {
  main: "mainQuizHighScore",
  preview: "previewQuizHighScore",
};

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4CAF50",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#FF6B9D",
  "#9B59B6",
  "#E74C3C",
];
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type ConfettiPiece = {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
};

export default function ResultsScreen() {
  const { score, total, quizType } = useLocalSearchParams<{
    score: string;
    total: string;
    quizType?: string;
  }>();
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const starAnim = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(0)).current;

  const confettiPieces: ConfettiPiece[] = Array.from(
    { length: 50 },
    (_, i) => ({
      id: i,
      x: Math.random() * (SCREEN_WIDTH - 20),
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 1500,
      size: Math.random() * 8 + 8,
    }),
  );

  const confettiAnimations = useRef(
    confettiPieces.map(() => ({
      translateY: new Animated.Value(-50),
      rotate: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    if (isNewHighScore) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(starAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.spring(starScale, {
              toValue: 1,
              friction: 3,
              tension: 40,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(starAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(starScale, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();

      confettiPieces.forEach((piece, index) => {
        const anim = confettiAnimations[index];
        Animated.loop(
          Animated.sequence([
            Animated.delay(piece.delay),
            Animated.parallel([
              Animated.timing(anim.translateY, {
                toValue: SCREEN_HEIGHT + 50,
                duration: 2000 + Math.random() * 1500,
                useNativeDriver: true,
              }),
              Animated.timing(anim.rotate, {
                toValue: 1,
                duration: 2000 + Math.random() * 1500,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim.translateY, {
              toValue: -50,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      });
    }
    return () => {
      starAnim.stopAnimation();
      starScale.stopAnimation();
      confettiAnimations.forEach((anim) => {
        anim.translateY.stopAnimation();
        anim.rotate.stopAnimation();
      });
    };
  }, [isNewHighScore]);

  const isPreviewQuiz = quizType === "preview";
  const storageKey = isPreviewQuiz
    ? HIGH_SCORE_KEYS.preview
    : HIGH_SCORE_KEYS.main;

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const currentScore = parseInt(score || "0", 10);
        const storedHighScore = parseInt(
          (await AsyncStorage.getItem(storageKey)) || "0",
          10,
        );

        if (currentScore > storedHighScore) {
          setHighScore(currentScore);
          setIsNewHighScore(true);
          await AsyncStorage.setItem(storageKey, currentScore.toString());
        } else {
          setHighScore(storedHighScore);
          setIsNewHighScore(false);
        }
      } catch (error) {
        console.error("Error loading high score:", error);
      }
    };

    loadHighScore();
  }, [score, storageKey]);

  const currentScore = parseInt(score || "0", 10);
  const totalQuestions = parseInt(total || "0", 10);
  const percentage =
    totalQuestions > 0 ? Math.round((currentScore / totalQuestions) * 100) : 0;

  const getMessage = () => {
    if (isNewHighScore) return "New High Score!";
    if (percentage >= 80) return "Excellent!";
    if (percentage >= 60) return "Good job!";
    if (percentage >= 40) return "Not bad!";
    return "Keep practicing!";
  };

  const quizTitle = isPreviewQuiz ? "Preview Quiz" : "Quiz";

  return (
    <View style={styles.container}>
      {isNewHighScore && (
        <>
          <View style={styles.celebrationContainer}>
            <Animated.Text
              style={[
                styles.celebrationEmoji,
                {
                  opacity: starAnim,
                  transform: [{ scale: starScale }],
                },
              ]}
            >
              ⭐
            </Animated.Text>
          </View>
          {confettiPieces.map((piece, index) => (
            <Animated.View
              key={piece.id}
              style={[
                styles.confetti,
                {
                  left: piece.x,
                  width: piece.size,
                  height: piece.size,
                  backgroundColor: piece.color,
                  transform: [
                    { translateY: confettiAnimations[index].translateY },
                    {
                      rotate: confettiAnimations[index].rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </>
      )}
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {quizTitle} Complete!
        </ThemedText>

        <ThemedText type="title" style={styles.message}>
          {getMessage()}
        </ThemedText>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <ThemedText type="default" style={styles.scoreLabel}>
              Your Score
            </ThemedText>
            <ThemedText type="title" style={styles.scoreValue}>
              {currentScore} / {totalQuestions}
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.percentage}>
              {percentage}%
            </ThemedText>
          </View>

          <View style={styles.scoreCard}>
            <ThemedText type="default" style={styles.scoreLabel}>
              {isPreviewQuiz ? "Preview" : "Main"} Best
            </ThemedText>
            <ThemedText type="title" style={styles.highScoreValue}>
              {highScore} / {totalQuestions}
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.percentage}>
              {totalQuestions > 0
                ? Math.round((highScore / totalQuestions) * 100)
                : 0}
              %
            </ThemedText>
          </View>
        </View>

        <View style={styles.buttonColumn}>
          {isPreviewQuiz ? (
            <Link href="/preview-quiz" asChild>
              <TouchableOpacity style={styles.button}>
                <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                  Try Again
                </ThemedText>
              </TouchableOpacity>
            </Link>
          ) : (
            <Link href="/quiz" asChild>
              <TouchableOpacity style={styles.button}>
                <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                  Try Again
                </ThemedText>
              </TouchableOpacity>
            </Link>
          )}

          <Link href="/" asChild>
            <TouchableOpacity style={styles.homeButton}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Home
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D3D47",
    overflow: "hidden",
  },
  celebrationContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  celebrationEmoji: {
    fontSize: 60,
  },
  confetti: {
    position: "absolute",
    borderRadius: 2,
    top: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
    color: "#FFFFFF",
  },
  message: {
    fontSize: 24,
    marginBottom: 32,
    color: "#A1CEDC",
  },
  scoreRow: {
    flexDirection: "row",
    marginBottom: 40,
  },
  scoreCard: {
    backgroundColor: "#2D5A6B",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 140,
    marginHorizontal: 8,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#A1CEDC",
  },
  scoreValue: {
    fontSize: 28,
    marginBottom: 4,
    color: "#FFFFFF",
  },
  highScoreValue: {
    fontSize: 28,
    marginBottom: 4,
    color: "#4CAF50",
  },
  percentage: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  buttonColumn: {
    alignItems: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#A1CEDC",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
    width: 200,
  },
  homeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
    width: 200,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});
