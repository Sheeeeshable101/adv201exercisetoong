import { ThemedText } from "@/components/themed-text";
import { Question, useQuizData } from "@/hooks/useQuizData";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function QuizSettingsScreen() {
  const { settings, updateTimer, addQuestion, updateQuestion, deleteQuestion } =
    useQuizData();
  const [timerInput, setTimerInput] = useState(
    settings.timerMinutes.toString(),
  );

  useEffect(() => {
    setTimerInput(settings.timerMinutes.toString());
  }, [settings.timerMinutes]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState<{ [key: string]: string }>({
    A: "",
    B: "",
    C: "",
    D: "",
  });
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [questionType, setQuestionType] = useState<"multiple" | "truefalse">(
    "multiple",
  );

  const handleTimerSave = () => {
    const minutes = parseInt(timerInput, 10);
    if (isNaN(minutes) || minutes < 1) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid number of minutes (minimum 1)",
      );
      return;
    }
    updateTimer(minutes);
    Alert.alert("Success", "Timer updated successfully!");
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setChoices({ A: "", B: "", C: "", D: "" });
    setCorrectAnswer("A");
    setQuestionType("multiple");
    setModalVisible(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setQuestionText(question.question);
    setChoices({ ...question.choices });
    setCorrectAnswer(
      Array.isArray(question.answer) ? question.answer[0] : question.answer,
    );
    setQuestionType(question.type === "truefalse" ? "truefalse" : "multiple");
    setModalVisible(true);
  };

  const handleSaveQuestion = () => {
    if (!questionText.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    const filledChoices =
      questionType === "truefalse"
        ? { A: "True", B: "False" }
        : Object.fromEntries(
            Object.entries(choices).filter(([_, value]) => value.trim() !== ""),
          );

    if (Object.keys(filledChoices).length < 2) {
      Alert.alert("Error", "Please add at least 2 choices");
      return;
    }

    const newQuestion: Question = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      type: questionType,
      question: questionText,
      choices: filledChoices,
      answer: correctAnswer,
    };

    if (editingQuestion) {
      updateQuestion(newQuestion);
    } else {
      addQuestion(newQuestion);
    }

    setModalVisible(false);
  };

  const handleDeleteQuestion = (id: number) => {
    Alert.alert(
      "Delete Question",
      "Are you sure you want to delete this question?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteQuestion(id);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Quiz Timer
          </ThemedText>
          <View style={styles.timerRow}>
            <TextInput
              style={styles.timerInput}
              value={timerInput}
              onChangeText={setTimerInput}
              keyboardType="numeric"
              placeholder="Enter minutes"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleTimerSave}
            >
              <ThemedText type="defaultSemiBold" style={styles.saveButtonText}>
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText type="default" style={styles.hint}>
            Current: {settings.timerMinutes} minutes
          </ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Quiz Items ({settings.questions.length})
            </ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
                + Add
              </ThemedText>
            </TouchableOpacity>
          </View>

          {settings.questions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.questionNumber}
                >
                  Q{index + 1}
                </ThemedText>
                <ThemedText type="default" style={styles.questionType}>
                  {question.type === "truefalse"
                    ? "True/False"
                    : "Multiple Choice"}
                </ThemedText>
              </View>
              <ThemedText type="default" style={styles.questionText}>
                {question.question}
              </ThemedText>
              <View style={styles.questionActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(question)}
                >
                  <ThemedText type="default" style={styles.editButtonText}>
                    Edit
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteQuestion(question.id)}
                >
                  <ThemedText type="default" style={styles.deleteButtonText}>
                    Delete
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <ThemedText type="default" style={styles.cancelText}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedText type="title" style={styles.modalTitle}>
              {editingQuestion ? "Edit Question" : "Add Question"}
            </ThemedText>
            <TouchableOpacity onPress={handleSaveQuestion}>
              <ThemedText type="default" style={styles.saveText}>
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText type="default" style={styles.label}>
                Question Type
              </ThemedText>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    questionType === "multiple" && styles.typeButtonActive,
                  ]}
                  onPress={() => setQuestionType("multiple")}
                >
                  <ThemedText
                    type="default"
                    style={[
                      styles.typeButtonText,
                      questionType === "multiple" &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    Multiple Choice
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    questionType === "truefalse" && styles.typeButtonActive,
                  ]}
                  onPress={() => setQuestionType("truefalse")}
                >
                  <ThemedText
                    type="default"
                    style={[
                      styles.typeButtonText,
                      questionType === "truefalse" &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    True/False
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="default" style={styles.label}>
                Question
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={questionText}
                onChangeText={setQuestionText}
                placeholder="Enter your question"
                placeholderTextColor="#888"
                multiline
              />
            </View>

            {questionType === "multiple" && (
              <View style={styles.formGroup}>
                <ThemedText type="default" style={styles.label}>
                  Choices
                </ThemedText>
                {["A", "B", "C", "D"].map((key) => (
                  <View key={key} style={styles.choiceRow}>
                    <TouchableOpacity
                      style={[
                        styles.radioButton,
                        correctAnswer === key && styles.radioButtonActive,
                      ]}
                      onPress={() => setCorrectAnswer(key)}
                    >
                      {correctAnswer === key && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </TouchableOpacity>
                    <TextInput
                      style={styles.choiceInput}
                      value={choices[key]}
                      onChangeText={(text) =>
                        setChoices({ ...choices, [key]: text })
                      }
                      placeholder={`Choice ${key}`}
                      placeholderTextColor="#888"
                    />
                  </View>
                ))}
                <ThemedText type="default" style={styles.hintSmall}>
                  Select the radio button to mark the correct answer
                </ThemedText>
              </View>
            )}

            {questionType === "truefalse" && (
              <View style={styles.formGroup}>
                <ThemedText type="default" style={styles.label}>
                  Correct Answer
                </ThemedText>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      correctAnswer === "A" && styles.typeButtonActive,
                    ]}
                    onPress={() => setCorrectAnswer("A")}
                  >
                    <ThemedText
                      type="default"
                      style={[
                        styles.typeButtonText,
                        correctAnswer === "A" && styles.typeButtonTextActive,
                      ]}
                    >
                      True
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      correctAnswer === "B" && styles.typeButtonActive,
                    ]}
                    onPress={() => setCorrectAnswer("B")}
                  >
                    <ThemedText
                      type="default"
                      style={[
                        styles.typeButtonText,
                        correctAnswer === "B" && styles.typeButtonTextActive,
                      ]}
                    >
                      False
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    marginBottom: 16,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timerInput: {
    flex: 1,
    backgroundColor: "#2D5A6B",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  hint: {
    color: "#A1CEDC",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  questionCard: {
    backgroundColor: "#2D5A6B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  questionNumber: {
    color: "#A1CEDC",
    fontSize: 14,
  },
  questionType: {
    color: "#888",
    fontSize: 12,
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 12,
  },
  questionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    marginRight: 16,
    padding: 8,
  },
  editButtonText: {
    color: "#A1CEDC",
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: "#FF6B6B",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1D3D47",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2D5A6B",
  },
  modalTitle: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  cancelText: {
    color: "#A1CEDC",
    fontSize: 16,
  },
  saveText: {
    color: "#4CAF50",
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#2D5A6B",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    minHeight: 100,
    textAlignVertical: "top",
  },
  typeButtons: {
    flexDirection: "row",
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#2D5A6B",
    marginRight: 8,
    alignItems: "center",
  },
  typeButtonActive: {
    borderColor: "#A1CEDC",
    backgroundColor: "#2D5A6B",
  },
  typeButtonText: {
    color: "#888",
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: "#A1CEDC",
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D5A6B",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonActive: {
    borderColor: "#4CAF50",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  choiceInput: {
    flex: 1,
    backgroundColor: "#2D5A6B",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#FFFFFF",
  },
  hintSmall: {
    color: "#888",
    fontSize: 12,
    marginTop: 8,
  },
});
