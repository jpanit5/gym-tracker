import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../supabase";

type BodyMetric = {
  weight: number | null;
  bmi: number | null;
  created_at: string;
};

type Progress = {
  exercise: string;
  weight: number | null;
  reps: number | null;
  duration: number | null;
  created_at: string;
};

const screenWidth = Dimensions.get("window").width;

/* HELPERS */
const average = (arr: number[]) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

const safeArray = (arr: number[]) =>
  arr.map((v) => {
    if (v === null || v === undefined || isNaN(Number(v))) {
      return 0;
    }
    return Number(v);
  });

const getWeekNumber = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays =
    (date.getTime() - firstDay.getTime()) / 86400000;
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
};

const formatLabel = (dateStr: string, filter: string) => {
  if (!dateStr) return "N/A";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";

  if (filter === "daily")
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  if (filter === "weekly") return `W${getWeekNumber(date)}`;
  if (filter === "monthly")
    return date.toLocaleString("en-US", { month: "short" });
  if (filter === "yearly") return date.getFullYear().toString();

  return "";
};

const groupData = (data: any[], filter: string) => {
  const grouped: Record<string, any[]> = {};

  data.forEach((item) => {
    const label = formatLabel(item.created_at, filter);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return grouped;
};

const cardioExercises = [
  "Jogging",
  "Sprint Intervals",
  "Cycling",
  "Jump Rope",
  "Stair Climber",
  "Rowing Machine",
  "Walking",
  "Yoga",
  "Stretching",
  "Foam Rolling",
];

export default function AnalyticsScreen() {
  const [bodyData, setBodyData] = useState<BodyMetric[]>([]);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [filter, setFilter] = useState("weekly");
  const [selectedExercise, setSelectedExercise] = useState("");

  // ✅ ADDED (debounce)
  const [debouncedExercise, setDebouncedExercise] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  // ✅ ADDED (debounce logic)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedExercise(selectedExercise);
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedExercise]);

  const fetchAll = async () => {
    const { data: body } = await supabase
      .from("body_metrics")
      .select("*")
      .order("created_at");

    const { data: progress } = await supabase
      .from("progress")
      .select("*")
      .order("created_at");

    setBodyData(body || []);
    setProgressData(progress || []);
  };

  /* BODY */
  const groupedBody = groupData(bodyData, filter);
  const bodyLabels = Object.keys(groupedBody);

  const weightData = safeArray(
    bodyLabels.map((k) =>
      average(
        groupedBody[k]
          .map((i) => i.weight)
          .filter((v): v is number => v !== null)
      )
    )
  );

  const bmiData = safeArray(
    bodyLabels.map((k) =>
      average(
        groupedBody[k]
          .map((i) => i.bmi)
          .filter((v): v is number => v !== null)
      )
    )
  );

  // ✅ FIXED (useMemo + debounce)
  const filteredProgress = useMemo(() => {
    if (!debouncedExercise) return [];

    return progressData.filter(
      (p) =>
        p &&
        typeof p.exercise === "string" &&
        p.exercise === debouncedExercise
    );
  }, [progressData, debouncedExercise]);

  const groupedExercise = groupData(filteredProgress, filter);
  const exLabels = Object.keys(groupedExercise);

  const exWeight = safeArray(
    exLabels.map((k) =>
      average(
        groupedExercise[k]
          .map((i) => i.weight)
          .filter((v): v is number => v !== null)
      )
    )
  );

  const exReps = safeArray(
    exLabels.map((k) =>
      average(
        groupedExercise[k]
          .map((i) => i.reps)
          .filter((v): v is number => v !== null)
      )
    )
  );

  const exDuration = safeArray(
    exLabels.map((k) =>
      average(
        groupedExercise[k]
          .map((i) => i.duration)
          .filter((v): v is number => v !== null)
      )
    )
  );

  const exercises = [
    ...new Set(
      progressData
        .map((p) => p.exercise)
        .filter((ex) => typeof ex === "string" && ex !== "")
    ),
  ];

  // ✅ FIXED
  const isCardio = cardioExercises.includes(debouncedExercise);

  const datasets = isCardio
    ? [{ data: exDuration.length ? exDuration : [0] }]
    : [
        { data: exWeight.length ? exWeight : [0] },
        { data: exReps.length ? exReps : [0] },
      ];

  const legend = isCardio
    ? ["Duration"]
    : ["Weight", "Reps"];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.title}>📊 Analytics</Text>

        <View style={styles.filterRow}>
          {["daily", "weekly", "monthly", "yearly"].map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterBtn,
                filter === f && styles.activeFilter,
              ]}
            >
              <Text style={{ color: filter === f ? "#fff" : "#2e7d32" }}>
                {f.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>Weight & BMI</Text>

          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: bodyLabels.length ? bodyLabels : ["No data"],
                datasets: [
                  { data: weightData.length ? weightData : [0] },
                  { data: bmiData.length ? bmiData : [0] },
                ],
                legend: ["Weight", "BMI"],
              }}
              width={Math.max(screenWidth - 60, 300)}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{ marginLeft: -10 }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>Select Exercise</Text>

          <Picker
            selectedValue={selectedExercise || ""}
            onValueChange={(val) => setSelectedExercise(val)}
          >
            <Picker.Item label="Select exercise..." value="" />
            {exercises.map((ex) => (
              <Picker.Item key={ex} label={ex} value={ex} />
            ))}
          </Picker>
        </View>

        {/* ✅ FIXED */}
        {debouncedExercise !== "" && (
          <View style={styles.card}>
            <Text style={styles.chartTitle}>
              {debouncedExercise} Progress
            </Text>

            <View style={styles.chartWrapper}>
              <LineChart
                data={{
                  labels: exLabels.length ? exLabels : ["No data"],
                  datasets,
                  legend,
                }}
                width={Math.max(screenWidth - 60, 300)}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{ marginLeft: -10 }}
              />
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

/* STYLE */

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 1,
  color: () => "#4CAF50",
  labelColor: () => "#2e7d32",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#dff5e3" },
  scroll: { padding: 20 },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
  },

  chartTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2e7d32",
  },

  chartWrapper: {
    overflow: "hidden",
    borderRadius: 16,
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  filterBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#c8e6c9",
  },

  activeFilter: {
    backgroundColor: "#4CAF50",
  },
});