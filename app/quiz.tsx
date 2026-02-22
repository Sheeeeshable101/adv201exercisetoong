import { ThemedText } from "@/components/themed-text";
import { questions } from "@/data/questions";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

type AnswerState = {
  [key: number]: string | string[];
};

export default function QuizScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

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

  const handleSubmit = () => {
    const finalScore = calculateScore();
    const href: Href = `/results?score=${finalScore}&total=${totalQuestions}`;
    router.replace(href);
  };

  return (
    <View style={styles.container}>
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
});
