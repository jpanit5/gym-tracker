import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase";

export default function SetupProfile() {
  const router = useRouter();

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateBMI = (w: number, h: number) => {
    const heightM = h / 100;
    return (w / (heightM * heightM)).toFixed(2);
  };

  const handleSave = async () => {
    if (!height || !weight) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const bmi = calculateBMI(Number(weight), Number(height));

    await supabase
      .from("profile")
      .update({
        height: Number(height),
        weight: Number(weight),
      })
      .eq("user_id", user.id);

    await supabase.from("body_metrics").insert({
      user_id: user.id,
      height: Number(height),
      weight: Number(weight),
      bmi: Number(bmi),
    });

    setLoading(false);
    router.replace("/(tabs)/home");
  };

  return (
    <LinearGradient
      colors={["#a8e063", "#56ab2f"]} // 🔥 splash vibes
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        
        {/* CARD */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: 25,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 15,
            elevation: 8,
          }}
        >
          {/* HEADER */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              marginBottom: 5,
              color: "#2e7d32",
            }}
          >
            Setup Your Profile 💪
          </Text>

          <Text style={{ color: "gray", marginBottom: 20 }}>
            Let’s personalize your fitness journey
          </Text>

          {/* HEIGHT */}
          <Text style={{ marginBottom: 5 }}>Height (cm)</Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="e.g. 170"
            style={{
              borderWidth: 1,
              borderColor: "#d4edda",
              padding: 12,
              borderRadius: 12,
              marginBottom: 15,
              backgroundColor: "#f9fff9",
            }}
          />

          {/* WEIGHT */}
          <Text style={{ marginBottom: 5 }}>Weight (kg)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="e.g. 65"
            style={{
              borderWidth: 1,
              borderColor: "#d4edda",
              padding: 12,
              borderRadius: 12,
              marginBottom: 20,
              backgroundColor: "#f9fff9",
            }}
          />

          {/* BUTTON */}
          <Pressable
            onPress={handleSave}
            style={{
              backgroundColor: "#2e7d32",
              padding: 15,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Save & Continue
              </Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}