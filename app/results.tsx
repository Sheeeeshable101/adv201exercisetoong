import { ThemedText } from "@/components/themed-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function ResultsScreen() {
  const { score, total } = useLocalSearchParams<{
    score: string;
    total: string;
  }>();
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const currentScore = parseInt(score || "0", 10);
        const storedHighScore = parseInt(
          (await AsyncStorage.getItem("highScore")) || "0",
          10,
        );

        if (currentScore > storedHighScore) {
          setHighScore(currentScore);
          await AsyncStorage.setItem("highScore", currentScore.toString());
        } else {
          setHighScore(storedHighScore);
        }
      } catch (error) {
        console.error("Error loading high score:", error);
      }
    };

    loadHighScore();
  }, [score]);

  const currentScore = parseInt(score || "0", 10);
  const totalQuestions = parseInt(total || "0", 10);
  const percentage =
    totalQuestions > 0 ? Math.round((currentScore / totalQuestions) * 100) : 0;

  const getMessage = () => {
    if (percentage >= 80) return "Excellent!";
    if (percentage >= 60) return "Good job!";
    if (percentage >= 40) return "Not bad!";
    return "Keep practicing!";
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Quiz Complete!
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
              Highest Score
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
          <Link href="/quiz" asChild>
            <TouchableOpacity style={styles.button}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Try Again
              </ThemedText>
            </TouchableOpacity>
          </Link>

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
