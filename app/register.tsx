import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const signUp = async () => {
    if (!email || !password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match ❌");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const user = data?.user;

      if (!user) {
        setMessage("User creation failed");
        return;
      }

      const { error: profileError } = await supabase
        .from("profile")
        .insert([
          {
            user_id: user.id,
            email,
            first_name: firstName,
            last_name: lastName,
          },
        ]);

      if (profileError) {
        setMessage("User created but profile failed");
        return;
      }

      setMessage("Registration successful! 💪");

      setTimeout(() => {
        router.replace("/");
      }, 1000);
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.logo}>Your Gym Tracker</Text>
            <Text style={styles.subtitle}>
              Start to build your best version!
            </Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            {/* EMAIL */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email"
              placeholderTextColor="#999"
              style={[styles.input, { color: "#000" }]}
              selectionColor="#000"
            />

            {/* FIRST NAME */}
            <Text style={styles.label}>First Name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter First Name"
              placeholderTextColor="#999"
              style={[styles.input, { color: "#000" }]}
              selectionColor="#000"
            />

            {/* LAST NAME */}
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter Last Name"
              placeholderTextColor="#999"
              style={[styles.input, { color: "#000" }]}
              selectionColor="#000"
            />

            {/* PASSWORD */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                style={{ flex: 1, color: "#000" }} // ✅ FIX HERE
                selectionColor="#000"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            {/* CONFIRM PASSWORD */}
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              style={[styles.input, { color: "#000" }]} // ✅ FIX HERE
              selectionColor="#000"
            />

            {/* MESSAGE */}
            {message ? <Text style={styles.error}>{message}</Text> : null}

            {/* BUTTON */}
            <Pressable onPress={signUp} style={styles.button}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>

            {/* LOGIN */}
            <Pressable onPress={() => router.push("/")}>
              <Text style={styles.link}>
                Already have an account? Login
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff5e3",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  subtitle: {
    color: "#4CAF50",
    marginTop: 5,
  },
  card: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2e7d32",
  },
  label: {
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#c8e6c9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#f1f8f4",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#f1f8f4",
  },
  showText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  link: {
    color: "#4CAF50",
    marginTop: 15,
    textAlign: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});