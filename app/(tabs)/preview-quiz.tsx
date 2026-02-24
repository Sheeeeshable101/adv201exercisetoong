import { ThemedText } from "@/components/themed-text";
import { useQuizData } from "@/hooks/useQuizData";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

type AnswerState = {
  [key: number]: string | string[];
};

export default function PreviewQuizScreen() {
  const router = useRouter();
  const { settings } = useQuizData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const questions = settings.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    setTimeRemaining(settings.timerMinutes * 60);
  }, [settings.timerMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(() => {
    const calculateScore = () => {
      let totalScore = 0;
      questions.forEach((q) => {
        const userAnswer = answers[q.id];
        if (q.type === "checkbox") {
          const correctAnswers = q.answer as string[];
          const userAnswers = (userAnswer as string[]) || [];
          const isCorrect =
            correctAnswers.length === userAnswers.length &&
            correctAnswers.every((a) => userAnswers.includes(a));
          if (isCorrect) totalScore++;
        } else {
          if (userAnswer === q.answer) totalScore++;
        }
      });
      return totalScore;
    };

    const finalScore = calculateScore();

    setTimeout(() => {
      const href: Href = `/results?score=${finalScore}&total=${totalQuestions}&quizType=preview`;
      router.replace(href);
    }, 500);
  }, [router, totalQuestions, questions, answers]);

  useEffect(() => {
    if (settings.timerMinutes <= 0) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [settings.timerMinutes, handleSubmit]);

  const handleAnswerSelect = (choiceKey: string) => {
    if (currentQuestion.type === "checkbox") {
      const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
      const newAnswers = currentAnswers.includes(choiceKey)
        ? currentAnswers.filter((a) => a !== choiceKey)
        : [...currentAnswers, choiceKey];
      setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: choiceKey });
    }
  };

  const isAnswerSelected = (choiceKey: string) => {
    const answer = answers[currentQuestion.id];
    if (Array.isArray(answer)) {
      return answer.includes(choiceKey);
    }
    return answer === choiceKey;
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <ThemedText type="title" style={styles.emptyText}>
            No Questions Available
          </ThemedText>
          <ThemedText type="default" style={styles.emptySubtext}>
            Please add questions in Quiz Settings
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {settings.timerMinutes > 0 && (
        <View style={styles.timerContainer}>
          <ThemedText type="default" style={styles.timerLabel}>
            Time Remaining
          </ThemedText>
          <ThemedText
            type="title"
            style={[
              styles.timerText,
              timeRemaining < 60 && styles.timerWarning,
            ]}
          >
            {formatTime(timeRemaining)}
          </ThemedText>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <ThemedText type="default" style={styles.progressText}>
            Question {currentIndex + 1} of {totalQuestions}
          </ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / totalQuestions) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.questionContainer}>
          <ThemedText type="title" style={styles.questionText}>
            {currentQuestion.question}
          </ThemedText>
        </View>

        <View style={styles.choicesContainer}>
          {Object.entries(currentQuestion.choices).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.choiceButton,
                isAnswerSelected(key) ? styles.choiceButtonSelected : null,
              ]}
              onPress={() => handleAnswerSelect(key)}
            >
              <ThemedText
                type="default"
                style={[
                  styles.choiceText,
                  isAnswerSelected(key) ? styles.choiceTextSelected : null,
                ]}
              >
                {key}. {value}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === 0 ? styles.navButtonDisabled : null,
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ThemedText type="defaultSemiBold" style={styles.navButtonText}>
              Previous
            </ThemedText>
          </TouchableOpacity>

          {currentIndex === totalQuestions - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <ThemedText type="defaultSemiBold" style={styles.navButtonText}>
                Submit
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
            >
              <ThemedText type="defaultSemiBold" style={styles.navButtonText}>
                Next
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D3D47",
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#2D5A6B",
    borderBottomWidth: 1,
    borderBottomColor: "#3D7A8B",
  },
  timerLabel: {
    color: "#A1CEDC",
    fontSize: 14,
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  timerWarning: {
    color: "#FF6B6B",
  },
  scrollContent: {
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    color: "#A1CEDC",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#2D5A6B",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#A1CEDC",
    borderRadius: 4,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    lineHeight: 28,
    color: "#FFFFFF",
  },
  choicesContainer: {
    marginBottom: 24,
  },
  choiceButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D5A6B",
    backgroundColor: "transparent",
    marginBottom: 12,
  },
  choiceButtonSelected: {
    borderColor: "#A1CEDC",
    backgroundColor: "#2D5A6B",
  },
  choiceText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  choiceTextSelected: {
    fontWeight: "bold",
    color: "#A1CEDC",
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2D5A6B",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  nextButton: {
    backgroundColor: "#A1CEDC",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#A1CEDC",
  },
});
