import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type Question = {
  id: number;
  type: "multiple" | "truefalse" | "checkbox";
  question: string;
  choices: { [key: string]: string };
  answer: string | string[];
};

export type QuizSettings = {
  timerMinutes: number;
  questions: Question[];
};

const STORAGE_KEY = "quiz_settings";
const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    type: "multiple",
    question: "What does CPU stand for?",
    choices: {
      A: "Central Process Unit",
      B: "Central Processing Unit",
      C: "Computer Personal Unit",
      D: "Central Program Utility",
    },
    answer: "B",
  },
  {
    id: 2,
    type: "multiple",
    question: "Which of the following is a programming language?",
    choices: {
      A: "HTML",
      B: "CSS",
      C: "Python",
      D: "HTTP",
    },
    answer: "C",
  },
  {
    id: 3,
    type: "multiple",
    question: "What symbol is used for comments in Python?",
    choices: {
      A: "//",
      B: "<!-- -->",
      C: "#",
      D: "/* */",
    },
    answer: "C",
  },
  {
    id: 4,
    type: "truefalse",
    question: "Boolean data type stores true or false values.",
    choices: {
      A: "True",
      B: "False",
    },
    answer: "A",
  },
  {
    id: 5,
    type: "multiple",
    question: "What is the result of 2 + 3 * 2?",
    choices: {
      A: "10",
      B: "7",
      C: "12",
      D: "8",
    },
    answer: "B",
  },
];

const DEFAULT_SETTINGS: QuizSettings = {
  timerMinutes: 10,
  questions: DEFAULT_QUESTIONS,
};

export function useQuizData() {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading quiz settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: QuizSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const updateTimer = useCallback(async (minutes: number) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, timerMinutes: minutes };
      // Save to AsyncStorage in the background
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings)).catch(
        (error) => console.error("Error saving settings:", error),
      );
      return newSettings;
    });
  }, []);

  const addQuestion = useCallback(async (question: Question) => {
    setSettings((prevSettings) => {
      const newQuestions = [...prevSettings.questions, question];
      const newSettings = { ...prevSettings, questions: newQuestions };
      // Save to AsyncStorage in the background
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings)).catch(
        (error) => console.error("Error saving settings:", error),
      );
      return newSettings;
    });
  }, []);

  const updateQuestion = useCallback(async (question: Question) => {
    setSettings((prevSettings) => {
      const newQuestions = prevSettings.questions.map((q) =>
        q.id === question.id ? question : q,
      );
      const newSettings = { ...prevSettings, questions: newQuestions };
      // Save to AsyncStorage in the background
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings)).catch(
        (error) => console.error("Error saving settings:", error),
      );
      return newSettings;
    });
  }, []);

  const deleteQuestion = useCallback(async (id: number) => {
    setSettings((prevSettings) => {
      const newQuestions = prevSettings.questions.filter((q) => q.id !== id);
      const newSettings = { ...prevSettings, questions: newQuestions };
      // Save to AsyncStorage in the background
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings)).catch(
        (error) => console.error("Error saving settings:", error),
      );
      return newSettings;
    });
  }, []);

  const resetToDefaults = useCallback(async () => {
    await saveSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    isLoading,
    updateTimer,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    resetToDefaults,
  };
}
