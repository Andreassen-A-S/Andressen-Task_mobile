import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getUserAssignments } from "@/lib/api";
import { Task } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { formatLocalDate, toLocalDateKey } from "@/helpers/helpers";
import CalendarMonthNavigator from "./CalendarMonthNavigator";
import CalendarTaskCard from "./CalendarTaskCard";
import UserTaskDetails from "../tasks/taskDetails/UserTaskDetails";
import UserHeader from "../common/UserHeader";
import { typography } from "@/constants/typography";

const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const assignments = await getUserAssignments(user.user_id);
        setTasks(assignments.map((a) => a.task).filter(Boolean));
      } catch {
        console.error("Error fetching tasks");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDow = firstDay.getDay();
    const prevMonthDays = startDow === 0 ? 6 : startDow - 1;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    for (let i = prevMonthDays; i > 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i + 1), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = toLocalDateKey(date);
    return tasks.filter((t) => toLocalDateKey(t.scheduled_date) === dateStr);
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

  const days = getDaysInMonth();
  const monthName = formatLocalDate(currentDate, "da-DK", { month: "long", year: "numeric" });
  const selectedTasks = getTasksForDate(selectedDate);

  return (
    <SafeAreaView className="flex-1 bg-[#1B1D22]" edges={["top", "left", "right"]}>
      <View className="flex-1 bg-[#F6F5F1]">
        {/* Header */}
        <UserHeader variant="user" heading="Kalender" sub="Overblik over kommende opgaver" user={user} />

        {/* Month Navigator */}
        <CalendarMonthNavigator monthName={monthName} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} />

        {/* Calendar Grid */}
        <View className="px-3 pt-3 pb-2">
          {/* Weekday headers */}
          <View className="flex-row gap-0.5 mb-1">
            {WEEKDAYS.map((d) => (
              <View key={d} className="flex-1 items-center py-1">
                <Text style={typography.labelSm}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Days */}
          <View className="flex-row flex-wrap gap-0.5">
            {days.map((day, idx) => {
              const hasTasks = getTasksForDate(day.date).length > 0;
              const isSelected = isSameDay(day.date, selectedDate);
              const isTodayDate = isToday(day.date);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedDate(day.date)}
                  style={{ width: `${(100 - 6 * 0.5) / 7}%` }}
                  className={`h-10 items-center justify-center rounded-lg ${!day.isCurrentMonth ? "opacity-30" : ""
                    } ${isTodayDate ? "bg-[#0f6e56]" : isSelected ? "bg-[#E8E6E1]" : ""}`}
                >
                  <Text style={[isTodayDate ? typography.labelSmWhite : typography.labelSm]}>
                    {day.date.getDate()}
                  </Text>
                  {hasTasks && (
                    <View
                      className="w-1 h-1 rounded-full mt-0.5"
                      style={{ backgroundColor: isTodayDate ? "rgba(255,255,255,0.7)" : "#0f6e56" }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="h-px bg-[#E8E6E1] mx-3" />

        {/* Selected day tasks */}
        <View className="flex-1 px-3 pt-3">
          <Text style={typography.labelSmUppercase} className="mb-2.5 px-1">
            {formatLocalDate(selectedDate, "da-DK", { weekday: "long", day: "numeric", month: "long" })} - {selectedTasks.length} {selectedTasks.length === 1 ? "opgave" : "opgaver"}
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#0f6e56" size="large" />
          ) : selectedTasks.length === 0 ? (
            <View className="flex-1 items-center justify-center pb-20">
              <View className="w-14 h-14 bg-white border border-[#E8E6E1] rounded-lg items-center justify-center mb-3">
                <Ionicons name="clipboard-outline" size={24} color="#6B7084" />
              </View>
              <Text style={typography.bodyMd}>Ingen opgaver</Text>
              <Text style={typography.bodyXs}>Der er ingen planlagte opgaver denne dag</Text>
            </View>
          ) : (
            <FlatList
              data={selectedTasks}
              keyExtractor={(item) => item.task_id}
              renderItem={({ item }) => (
                <CalendarTaskCard task={item} onClick={() => setSelectedTaskId(item.task_id)} />
              )}
              contentContainerClassName="gap-1.5 pb-6"
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Task Details Modal */}
        <Modal
          visible={!!selectedTaskId}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedTaskId(null)}
        >
          {selectedTaskId && (
            <UserTaskDetails taskId={selectedTaskId} onBack={() => setSelectedTaskId(null)} />
          )}
        </Modal>
      </View>
    </SafeAreaView>
  );
}
