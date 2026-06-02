import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  SectionList,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { getUserAssignments } from "@/lib/api";
import { Task } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { formatLocalDate, toDateKey } from "@/helpers/helpers";
import CalendarMonthNavigator from "./CalendarMonthNavigator";
import UserHeader from "../common/UserHeader";
import { colors } from "@/constants/colors";
import ErrorState from "../common/ErrorState";
import CalendarMonthPager from "./CalendarMonthPager";
import CalendarAgenda, { MonthAgendaSection } from "./CalendarAgenda";
import {
  YEAR_RANGE,
  addMonths,
  getDaysInMonth,
  getGridHeight,
  getMonthDiff,
  getMonthStart,
} from "./calendarUtils";

const MONTH_COUNT = YEAR_RANGE * 12 * 2 + 1;

function clampIndex(index: number) {
  return Math.min(Math.max(index, 0), MONTH_COUNT - 1);
}

function buildMonths(today: Date): Date[] {
  const months: Date[] = [];
  const startMonth = addMonths(getMonthStart(today), -YEAR_RANGE * 12);
  for (let i = 0; i < MONTH_COUNT; i++) {
    months.push(addMonths(startMonth, i));
  }
  return months;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const monthListRef = useRef<FlatList<Date>>(null);
  const agendaListRef = useRef<SectionList<Task, MonthAgendaSection>>(null);
  const hasLoadedRef = useRef(false);
  const pageWidth = Math.max(1, width);

  const [today, setToday] = useState(() => new Date());
  const todayStr = today.toDateString();

  const allMonths = useMemo(() => buildMonths(today), [today]);
  const prevAllMonthsRef = useRef(allMonths);

  // visibleMonth is the source of truth; visibleMonthIndex is derived
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(new Date()));
  const visibleMonthIndex = useMemo(
    () => clampIndex(getMonthDiff(allMonths[0], visibleMonth)),
    [allMonths, visibleMonth]
  );

  // Re-anchor FlatList when allMonths rebuilds (e.g. midnight month rollover)
  useEffect(() => {
    if (prevAllMonthsRef.current === allMonths) return;
    prevAllMonthsRef.current = allMonths;
    monthListRef.current?.scrollToIndex({ index: visibleMonthIndex, animated: false });
  }, [allMonths, visibleMonthIndex]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (refresh = false) => {
    if (!user?.user_id) return;
    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);
      const assignments = await getUserAssignments(user.user_id);
      setTasks(assignments.map((a) => ({ ...a.task, goal: a.task.goal ?? null })).filter(Boolean));
    } catch {
      setError("Kunne ikke hente opgaver. Prøv igen senere.");
    } finally {
      refresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  }, [user?.user_id]);

  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      setToday((prev) => (prev.toDateString() === now.toDateString() ? prev : now));
      fetchTasks(hasLoadedRef.current);
      hasLoadedRef.current = true;
    }, [fetchTasks])
  );

  const tasksByDate = useMemo(() => {
    const byDate = new Map<string, Task[]>();
    for (const task of tasks) {
      const startKey = toDateKey(task.start_date);
      const dayTasks = byDate.get(startKey);
      if (dayTasks) {
        dayTasks.push(task);
      } else {
        byDate.set(startKey, [task]);
      }
    }
    return byDate;
  }, [tasks]);

  const getTaskCountForDate = useCallback((date: Date) => {
    return tasksByDate.get(toDateKey(date))?.length ?? 0;
  }, [tasksByDate]);

  const scrollToMonthIndex = useCallback((index: number, animated = true) => {
    const nextIndex = clampIndex(index);
    const nextMonth = allMonths[nextIndex];
    if (nextMonth) {
      setVisibleMonth(nextMonth);
      monthListRef.current?.scrollToIndex({ index: nextIndex, animated });
    }
  }, [allMonths]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    const monthStart = getMonthStart(date);
    const nextIndex = clampIndex(getMonthDiff(allMonths[0], monthStart));
    if (nextIndex !== visibleMonthIndex) {
      setVisibleMonth(monthStart);
      monthListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  }, [allMonths, visibleMonthIndex]);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = clampIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
    const month = allMonths[index];
    if (month && month.getTime() !== visibleMonth.getTime()) {
      setVisibleMonth(month);
    }
  }, [allMonths, pageWidth, visibleMonth]);

  const monthName = formatLocalDate(visibleMonth, "da-DK", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase());
  const gridHeight = getGridHeight(visibleMonth);
  const selectedDateKey = toDateKey(selectedDate);

  const monthSections = useMemo<MonthAgendaSection[]>(() => {
    return getDaysInMonth(visibleMonth)
      .filter((day) => day.isCurrentMonth)
      .map((day) => {
        const dateKey = toDateKey(day.date);
        return { date: day.date, dateKey, data: tasksByDate.get(dateKey) ?? [] };
      })
      .filter((section) => section.data.length > 0);
  }, [tasksByDate, visibleMonth]);

  const agendaPaddingBottom = useMemo(() => {
    const sectionIndex = monthSections.findIndex((s) => s.dateKey === selectedDateKey);
    if (sectionIndex >= 0 && sectionIndex >= monthSections.length - 3) {
      return height * 0.3;
    }
    return 24;
  }, [monthSections, selectedDateKey, height]);

  useEffect(() => {
    const sectionIndex = monthSections.findIndex((section) => section.dateKey === selectedDateKey);
    if (sectionIndex < 0) return;

    requestAnimationFrame(() => {
      agendaListRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewPosition: 0,
        animated: true,
      });
    });
  }, [monthSections, selectedDateKey]);

  return (
    <SafeAreaView className="flex-1" edges={["left", "right"]} style={{ backgroundColor: colors.charcoal }}>
      <View className="flex-1" style={{ backgroundColor: colors.eggWhite }}>
        <UserHeader variant="user" heading="Kalender" sub="Overblik over kommende opgaver" user={user} />

        <View className="pb-3 border-b" style={{ backgroundColor: colors.white, borderBottomColor: colors.border }}>
          <CalendarMonthNavigator
            monthName={monthName}
            onPrev={() => scrollToMonthIndex(visibleMonthIndex - 1)}
            onNext={() => scrollToMonthIndex(visibleMonthIndex + 1)}
          />

          <CalendarMonthPager
            months={allMonths}
            initialMonthIndex={visibleMonthIndex}
            listRef={monthListRef}
            pageWidth={pageWidth}
            gridHeight={gridHeight}
            selectedDate={selectedDate}
            todayStr={todayStr}
            getTaskCountForDate={getTaskCountForDate}
            onSelectDate={handleSelectDate}
            onMomentumScrollEnd={handleMomentumScrollEnd}
          />
        </View>

        {error ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchTasks(true)} />}
          >
            <ErrorState message={error} onRetry={() => fetchTasks()} />
          </ScrollView>
        ) : (
          <CalendarAgenda
            ref={agendaListRef}
            sections={monthSections}
            selectedDateKey={selectedDateKey}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            paddingBottom={agendaPaddingBottom}
            onRefresh={() => fetchTasks(true)}
            onTaskPress={(taskId) => router.push(`/(tabs)/calendar/${taskId}`)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
