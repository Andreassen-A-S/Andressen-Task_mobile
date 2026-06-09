import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/constants/colors";
import {
  DAY_CELL_HEIGHT,
  WEEKDAYS,
  getDaysInMonth,
  getGridHeight,
} from "./calendarUtils";

interface MonthGridPageProps {
  date: Date;
  selectedDate: Date;
  todayStr: string;
  getTaskCountForDate: (date: Date) => number;
  onSelectDate: (date: Date) => void;
}

function CalendarWeekdayHeader() {
  return (
    <View className="flex-row gap-0.5 px-3 pt-3 pb-1">
      {WEEKDAYS.map((day) => (
        <View key={day} className="flex-1 items-center py-1">
          <Text className="label-sm">{day}</Text>
        </View>
      ))}
    </View>
  );
}

const MonthGridPage = React.memo(function MonthGridPage({ date, selectedDate, todayStr, getTaskCountForDate, onSelectDate }: MonthGridPageProps) {
  const days = useMemo(() => getDaysInMonth(date), [date]);

  return (
    <View className="px-3">
      <View className="flex-row flex-wrap gap-0.5" style={{ alignContent: "flex-start" }}>
        {days.map((day, idx) => {
          const taskCount = getTaskCountForDate(day.date);
          const isSelected = day.date.toDateString() === selectedDate.toDateString();
          const isTodayDate = day.date.toDateString() === todayStr;
          const dotColor = isSelected ? colors.white : colors.green;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectDate(day.date)}
              style={{
                width: `${(100 - 6 * 0.5) / 7}%`,
                height: DAY_CELL_HEIGHT,
                backgroundColor: isSelected ? colors.green : "transparent",
              }}
              className={`items-center justify-center rounded-lg ${!day.isCurrentMonth ? "opacity-30" : ""}`}
            >
              <Text className={`${isTodayDate ? "h6 underline" : "label-sm"}${isSelected ? " !text-white" : ""}`}>
                {day.date.getDate()}
              </Text>

              {taskCount > 0 && (
                <View className="flex-row gap-0.5 mt-0.5" style={isTodayDate && !isSelected ? { marginTop: 2 } : undefined}>
                  <View className="w-1 h-1 rounded-full" style={{ backgroundColor: dotColor }} />
                  {taskCount > 1 && <View className="w-1 h-1 rounded-full" style={{ backgroundColor: dotColor }} />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

interface CalendarMonthPagerProps {
  months: Date[];
  initialMonthIndex: number;
  listRef: React.RefObject<FlatList<Date> | null>;
  pageWidth: number;
  gridHeight: number;
  selectedDate: Date;
  todayStr: string;
  getTaskCountForDate: (date: Date) => number;
  onSelectDate: (date: Date) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export default function CalendarMonthPager({
  months,
  initialMonthIndex,
  listRef,
  pageWidth,
  gridHeight,
  selectedDate,
  todayStr,
  getTaskCountForDate,
  onSelectDate,
  onMomentumScrollEnd,
}: CalendarMonthPagerProps) {
  const extraData = useMemo(
    () => ({ selectedDate, todayStr, getTaskCountForDate }),
    [selectedDate, todayStr, getTaskCountForDate]
  );

  const renderMonth = useCallback(({ item }: { item: Date }) => (
    <View style={{ width: pageWidth, height: getGridHeight(item) }}>
      <MonthGridPage
        date={item}
        selectedDate={selectedDate}
        todayStr={todayStr}
        getTaskCountForDate={getTaskCountForDate}
        onSelectDate={onSelectDate}
      />
    </View>
  ), [getTaskCountForDate, onSelectDate, pageWidth, selectedDate, todayStr]);

  return (
    <>
      <CalendarWeekdayHeader />
      <FlatList
        ref={listRef}
        data={months}
        keyExtractor={(date) => `${date.getFullYear()}-${date.getMonth()}`}
        renderItem={renderMonth}
        horizontal
        pagingEnabled
        initialScrollIndex={initialMonthIndex}
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={({ index }) => {
          listRef.current?.scrollToOffset({ offset: pageWidth * index, animated: false });
        }}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={{ height: gridHeight, maxHeight: gridHeight, flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ height: gridHeight }}
        extraData={extraData}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews
      />
    </>
  );
}
