import { ThemedText } from "@/components/themed-text";
import { Link } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Quiz App
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Test your knowledge!
        </ThemedText>

        <Link href="/quiz" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Start Quiz
            </ThemedText>
          </TouchableOpacity>
        </Link>
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
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: "#A1CEDC",
  },
  button: {
    backgroundColor: "#A1CEDC",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 18,
    color: "#1D3D47",
  },
});
