import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../supabase";

export default function HomeScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // 🔥 NEW
  const [firstName, setFirstName] = useState("");
  const [quote, setQuote] = useState("");

  // 🔥 MANY QUOTES
  const quotes = [
    "No pain, no gain.",
    "Push yourself, no one else will.",
    "Consistency is key.",
    "Discipline beats motivation.",
    "Train insane or remain the same.",
    "Small progress is still progress.",
    "Your only limit is you.",
    "Don’t stop when you’re tired. Stop when you’re done.",
    "Success starts with self-discipline.",
    "Wake up. Work out. Repeat.",
    "Stronger every day.",
    "The body achieves what the mind believes.",
    "Excuses don’t burn calories.",
    "Be stronger than your strongest excuse.",
    "Results happen over time, not overnight.",
    "You don’t have to be extreme, just consistent.",
    "Sweat is just fat crying.",
    "Make yourself proud.",
    "One more rep. One more step.",
    "Your future self will thank you.",
  ];

  // 🔥 CHECK PROFILE (MAIN LOGIC)
  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("profile")
        .select("height")
        .eq("user_id", user.id)
        .single();

      if (!data?.height) {
        router.replace("/setup-profile");
      } else {
        setChecking(false); // ✅ ready na UI
      }
    };

    checkProfile();
  }, []);

  // 🔥 QUOTE LOGIC
  useEffect(() => {
    const getQuote = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const today = new Date().toDateString();
      const base = userId ? userId + today : today;

      let hash = 0;
      for (let i = 0; i < base.length; i++) {
        hash = (hash << 5) - hash + base.charCodeAt(i);
        hash |= 0;
      }

      const index = Math.abs(hash) % quotes.length;
      setQuote(quotes[index]);
    };

    getQuote();
  }, []);

  // 🔥 GET USER NAME
  useEffect(() => {
    const getUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return setFirstName("Bro");

      const { data } = await supabase
        .from("profile")
        .select("first_name")
        .eq("user_id", userId)
        .single();

      setFirstName(data?.first_name || "Bro");
    };

    getUser();
  }, []);

  // 🔥 LOADING SCREEN (IMPORTANT)
  if (checking) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, color: "#2e7d32" }}>
          Loading your profile...
        </Text>
      </SafeAreaView>
    );
  }

  // 🔥 LOGOUT
  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace("/");
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi {firstName}!</Text>
          <Text style={styles.subtext}>
            Ready to crush your workout today?
          </Text>

          <Text style={styles.quote}>
            "{quote}"
          </Text>
        </View>

        {/* CARDS */}
        <View style={styles.cardContainer}>
          <Pressable onPress={() => router.push("/create-plan")} style={styles.card}>
            <Text style={styles.cardTitle}>🏋️ Create Plan</Text>
            <Text style={styles.cardDesc}>Build your custom routine</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/progress")} style={styles.card}>
            <Text style={styles.cardTitle}>📊 Progress</Text>
            <Text style={styles.cardDesc}>Track your improvements</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/analytics")} style={styles.card}>
            <Text style={styles.cardTitle}>📈 Analytics</Text>
            <Text style={styles.cardDesc}>See your performance insights</Text>
          </Pressable>
        </View>

        {/* LOGOUT */}
        <View style={{ marginTop: "auto" }}>
          <Pressable onPress={handleLogout} style={styles.logout}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.logoutText}>Logout</Text>
            )}
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

/* 🔥 STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff5e3",
  },
  wrapper: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  subtext: {
    color: "#4CAF50",
    marginTop: 5,
  },
  quote: {
    marginTop: 15,
    fontStyle: "italic",
    textAlign: "center",
    color: "#2e7d32",
    fontSize: 16,
  },
  cardContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 18,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  cardDesc: {
    color: "#666",
    marginTop: 5,
  },
  logout: {
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dff5e3",
  },
});