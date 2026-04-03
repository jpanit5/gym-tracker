import { Picker } from "@react-native-picker/picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../supabase";

/* TYPE */
type Workout = {
  exercise: string;
};

const days = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

export default function ProgressScreen() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [exercise, setExercise] = useState("");
  const [exercises, setExercises] = useState<string[]>([]);

  const [bodyWeight, setBodyWeight] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [speed, setSpeed] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState("");

  const speedSet = useMemo(() => new Set(["Jogging", "Sprint Intervals", "Cycling"]), []);
  const durationSet = useMemo(() => new Set(["Jump Rope", "Stretching", "Yoga", "Walking"]), []);

  const safeExercise = typeof exercise === "string" ? exercise : "";

  const isSpeed = speedSet.has(safeExercise);
  const isDuration = durationSet.has(safeExercise);
  const isCardio = isSpeed || isDuration;

  const safeNumber = (val: string) => {
    if (!val || val.trim() === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const onlyNumber = (val: string, setter: (v: string) => void) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    setter(cleaned);
  };

  const activeRequest = useRef(0);

  const fetchExercises = useCallback(async (day: string) => {
    const requestId = ++activeRequest.current;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("workouts")
      .select("exercise")
      .eq("day", day)
      .eq("user_id", user.id);

    if (requestId !== activeRequest.current) return;

    if (error) return;

    if (!data) {
      setExercises([]);
      return;
    }

    const unique = [...new Set(data.map((d) => d.exercise))];
    setExercises(unique);
  }, []);

  // ✅ FIX: reset message pag change day
  useEffect(() => {
    fetchExercises(selectedDay);
    setExercise("");
    setMessage("");
  }, [selectedDay, fetchExercises]);

  const exerciseItems = useMemo(() => {
    return exercises.map((ex) => (
      <Picker.Item key={ex} label={ex} value={ex} color="#000" />
    ));
  }, [exercises]);

  const saveProgress = async () => {
    if (!exercise) {
      setMessage("Please select an exercise");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (bodyWeight) {
      await supabase.from("body_metrics").insert([
        {
          user_id: user.id,
          weight: safeNumber(bodyWeight),
        },
      ]);
    }

    const payload = {
      user_id: user.id,
      day: selectedDay,
      exercise,
      weight: !isCardio ? safeNumber(weight) : null,
      reps: !isCardio ? safeNumber(reps) : null,
      speed: isSpeed ? safeNumber(speed) : null,
      duration: isDuration ? safeNumber(duration) : null,
    };

    const { error } = await supabase.from("progress").insert([payload]);

    if (error) {
      setMessage(error.message);
      return;
    }

    // ✅ FIX: show then auto-hide
    setMessage("Saved! 💪");

    setTimeout(() => {
      setMessage("");
    }, 2000);

    setExercise("");
    setWeight("");
    setReps("");
    setSpeed("");
    setDuration("");
    setBodyWeight("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <Text style={styles.title}>📊 Track Progress</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayButton,
                selectedDay === day && styles.activeDay
              ]}
            >
              <Text style={{
                color: selectedDay === day ? "white" : "#333"
              }}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.card}>

          <Text style={styles.label}>Track Weight (kg)</Text>
          <TextInput
            value={bodyWeight}
            onChangeText={(v) => onlyNumber(v, setBodyWeight)}
            keyboardType="numeric"
            placeholder="Enter your weight"
            style={styles.input}
          />

          <Text style={styles.label}>Exercise</Text>

          <View style={styles.picker}>
            <Picker
              selectedValue={exercise || ""}
              onValueChange={(val) => {
                setExercise(val);
                setMessage(""); // ✅ FIX
              }}
              style={{ color: "#000" }}
            >
              <Picker.Item label="Select Exercise" value="" color="#000" />
              {exerciseItems}
            </Picker>
          </View>

          {exercises.length === 0 && (
            <Text style={styles.emptyText}>
              No workouts set for this day
            </Text>
          )}

          {!isCardio && safeExercise !== "" && (
            <>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                value={weight}
                onChangeText={(v) => onlyNumber(v, setWeight)}
                keyboardType="numeric"
                placeholder="optional"
                style={styles.input}
              />

              <Text style={styles.label}>Reps</Text>
              <TextInput
                value={reps}
                onChangeText={(v) => onlyNumber(v, setReps)}
                keyboardType="numeric"
                placeholder="optional"
                style={styles.input}
              />
            </>
          )}

          {isSpeed && (
            <>
              <Text style={styles.label}>Speed (km/h)</Text>
              <TextInput
                value={speed}
                onChangeText={(v) => onlyNumber(v, setSpeed)}
                keyboardType="numeric"
                placeholder="optional"
                style={styles.input}
              />
            </>
          )}

          {isDuration && (
            <>
              <Text style={styles.label}>Duration (mins)</Text>
              <TextInput
                value={duration}
                onChangeText={(v) => onlyNumber(v, setDuration)}
                keyboardType="numeric"
                placeholder="optional"
                style={styles.input}
              />
            </>
          )}

          <TouchableOpacity onPress={saveProgress} style={styles.button}>
            <Text style={styles.buttonText}>Save Progress</Text>
          </TouchableOpacity>

          {message !== "" && (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* 🔥 STYLE (UNCHANGED) */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#dff5e3" },
  scroll: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#2e7d32" },
  dayButton: { padding: 10, backgroundColor: "#e0e0e0", borderRadius: 12, marginRight: 8 },
  activeDay: { backgroundColor: "#4CAF50" },
  card: {
    marginTop: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 6,
  },
  label: { fontWeight: "bold", marginBottom: 5, color: "#2e7d32" },
  picker: {
    borderWidth: 1,
    borderColor: "#c8e6c9",
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#c8e6c9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#f1f8f4",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
  message: { marginTop: 10, color: "#2e7d32", textAlign: "center" },
  emptyText: { color: "gray", marginBottom: 10 },
});