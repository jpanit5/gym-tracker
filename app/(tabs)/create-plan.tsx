import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../supabase";

/* TYPES */
type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

/* WEEK HELPER */
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  return monday.toISOString();
};

export default function WorkoutPlanScreen() {
  const [openDay, setOpenDay] = useState<Day | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [lockedDays, setLockedDays] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState(getWeekStart());

  const days: Day[] = [
    "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
  ];

  const workoutPlan: Record<Day, string[]> = { /* SAME */ 
    Monday: ["Pull Day","Back:","- Pull Ups","- Lat Pulldown","- Seated Cable Row","- Deadlift","- T-Bar Row","- Single Arm Dumbbell Row","Biceps:","- Barbell Curl","- Hammer Curl","- Preacher Curl","- Concentration Curl"],
    Tuesday: ["Push Day","Chest:","- Bench Press","- Incline Bench Press","- Decline Bench Press","- Chest Fly","- Cable Fly","Shoulders:","- Overhead Press","- Lateral Raise","- Front Raise","- Rear Delt Fly","Triceps:","- Tricep Pushdown","- Skull Crushers","- Dips"],
    Wednesday: ["Cardio Day","- Jogging","- Sprint Intervals","- Cycling","- Jump Rope","- Stair Climber","- Rowing Machine"],
    Thursday: ["Arm Day","Shoulders:","- Overhead Press","- Arnold Press","- Lateral Raise","- Front Raise","- Rear Delt Fly","Biceps:","- Barbell Curl","- Hammer Curl","- Cable Curl","- Spider Curl","Triceps:","- Tricep Pushdown","- Overhead Extension","- Close Grip Bench Press","- Bench Dips","Forearms:","- Wrist Curl","- Reverse Wrist Curl","- Farmer’s Walk","- Plate Pinch Hold"],
    Friday: ["Core + Chest + Back Day","Core:","- Crunches","- Sit-ups","- Plank","- Hanging Leg Raise","- Russian Twist","- Mountain Climbers","- Bicycle Crunch","Chest:","- Push Ups","- Incline Push Ups","- Decline Push Ups","- Dumbbell Chest Press","- Chest Fly","Back:","- Pull Ups","- Inverted Row","- Lat Pulldown","- Seated Row","- Superman Hold"],
    Saturday: ["Leg Day","- Squats","- Leg Press","- Lunges","- Bulgarian Split Squat","- Romanian Deadlift","- Leg Curl","- Calf Raises"],
    Sunday: ["Recovery Day","- Stretching","- Yoga","- Walking","- Foam Rolling"],
  };

  /* ✅ OPTIMIZED: Set for fast lookup */
  const selectedSet = useMemo(() => new Set(selectedExercises), [selectedExercises]);

  const loadLockedDays = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("workouts")
      .select("day")
      .eq("user_id", user.id)
      .eq("week_start", weekStart);

    if (!data) return;

    const locked: Record<string, boolean> = {};
    data.forEach((item) => {
      locked[item.day] = true;
    });

    setLockedDays(locked);
  };

  useEffect(() => {
    loadLockedDays();
  }, [weekStart]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newWeek = getWeekStart();
      if (newWeek !== weekStart) {
        setWeekStart(newWeek);
        setLockedDays({});
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [weekStart]);

  /* ✅ useCallback (stable functions) */
  const toggleDay = useCallback((day: Day) => {
    if (lockedDays[day]) return;
    setOpenDay((prev) => (prev === day ? null : day));
    setSelectedExercises([]);
  }, [lockedDays]);

  const toggleExercise = useCallback((exercise: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exercise)
        ? prev.filter((e) => e !== exercise)
        : [...prev, exercise]
    );
  }, []);

  const saveWorkouts = async (day: Day) => {
    if (lockedDays[day]) return;

    if (selectedExercises.length === 0) {
      alert("Select at least one exercise");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = selectedExercises.map((ex) => ({
      day,
      exercise: ex,
      user_id: user.id,
      week_start: weekStart,
    }));

    const { error } = await supabase
      .from("workouts")
      .insert(payload);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setLockedDays((prev) => ({
      ...prev,
      [day]: true,
    }));

    setOpenDay(null);
    setSelectedExercises([]);
  };

  const retainLastWeek = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const lastWeek = new Date(
      new Date(weekStart).getTime() - 7 * 86400000
    ).toISOString();

    const { data } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", lastWeek);

    if (!data || data.length === 0) {
      alert("No previous week data");
      return;
    }

    const newData = data.map((item) => ({
      ...item,
      id: undefined,
      week_start: weekStart,
    }));

    await supabase.from("workouts").insert(newData);

    alert("Workout copied 💪");

    loadLockedDays();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#dff5e3" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

        <Text style={{
          fontSize: 26,
          fontWeight: "bold",
          color: "#2e7d32",
          marginBottom: 15,
        }}>
          💪 Workout Plan
        </Text>

        <Pressable
          onPress={retainLastWeek}
          style={{
            backgroundColor:"#2e7d32",
            padding:12,
            borderRadius:12,
            alignItems:"center",
            marginBottom:15,
          }}
        >
          <Text style={{ color:"white", fontWeight:"bold" }}>
            🔁 Retain Last Week
          </Text>
        </Pressable>

        {days.map((day) => {
          const isOpen = openDay === day;
          const isLocked = lockedDays[day];

          return (
            <View key={day} style={{
              backgroundColor: "white",
              padding: 16,
              borderRadius: 20,
              marginBottom: 15,
              shadowColor: "#4CAF50",
              shadowOpacity: 0.25,
              shadowRadius: 15,
              elevation: 6,
            }}>
              <Pressable onPress={() => toggleDay(day)}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#2e7d32"
                }}>
                  {day} {isLocked && "🔒"}
                </Text>
              </Pressable>

              {isOpen && (
                <View style={{ marginTop: 10 }}>
                  {workoutPlan[day].map((item, index) => {
                    const isExercise = item.startsWith("-");
                    const exercise = item.replace("-", "").trim();
                    const isSelected = selectedSet.has(exercise); // ✅ FAST

                    if (!isExercise) {
                      return (
                        <Text key={index} style={{
                          fontWeight:"bold",
                          marginTop:10,
                          color:"#4CAF50"
                        }}>
                          {item}
                        </Text>
                      );
                    }

                    return (
                      <Pressable
                        key={exercise}
                        onPress={() => toggleExercise(exercise)}
                        style={{
                          padding: 10,
                          backgroundColor: isSelected ? "#4CAF50" : "#e8f5e9",
                          borderRadius: 10,
                          marginTop:5,
                        }}
                      >
                        <Text style={{
                          color: isSelected ? "white" : "#2e7d32"
                        }}>
                          {exercise}
                        </Text>
                      </Pressable>
                    );
                  })}

                  <Pressable
                    onPress={() => saveWorkouts(day)}
                    style={{
                      marginTop: 15,
                      backgroundColor: "#4CAF50",
                      padding: 14,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={{ color: "white", fontWeight:"bold" }}>
                        Save Workout
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}