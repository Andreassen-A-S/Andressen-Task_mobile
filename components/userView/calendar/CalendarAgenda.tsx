import React from "react";
import { ActivityIndicator, SectionList, Text, View } from "react-native";
import { ClipboardList } from "lucide-react-native";
import { Task } from "@/types/task";
import { formatLocalDate } from "@/helpers/helpers";
import { colors } from "@/constants/colors";
import CalendarTaskCard from "./CalendarTaskCard";

export interface MonthAgendaSection {
  date: Date;
  dateKey: string;
  data: Task[];
}

interface CalendarAgendaProps {
  sections: MonthAgendaSection[];
  selectedDateKey: string;
  isLoading: boolean;
  isRefreshing: boolean;
  paddingBottom: number;
  onRefresh: () => void;
  onTaskPress: (taskId: string) => void;
}

const CalendarAgenda = React.forwardRef<SectionList<Task, MonthAgendaSection>, CalendarAgendaProps>(function CalendarAgenda({
  sections,
  selectedDateKey,
  isLoading,
  isRefreshing,
  paddingBottom,
  onRefresh,
  onTaskPress,
}, ref) {
  return (
    <View className="flex-1 px-3">
      <SectionList
        ref={ref}
        sections={sections}
        keyExtractor={(item) => item.task_id}
        renderItem={({ item, index, section }) => {
          const isFocusedDate = section.dateKey === selectedDateKey;
          const showDateLabel = index === 0;
          return (
            <View className="flex-row items-start">
              <View className="w-14 items-center pt-1">
                {showDateLabel && (
                  <>
                    <Text
                      className={`label-sm ${isFocusedDate ? "text-accent" : "text-secondary"}`}
                    >
                      {formatLocalDate(section.date, "da-DK", { weekday: "short" }).replace(".", "")}
                    </Text>
                    <Text
                      className={`h2 ${isFocusedDate ? "text-accent" : ""}`}
                    >
                      {String(section.date.getDate()).padStart(2, "0")}
                    </Text>
                  </>
                )}
              </View>
              <View className="flex-1">
                <View
                  className="rounded-xl"
                  style={isFocusedDate ? { shadowColor: colors.green, shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } } : undefined}
                >
                  <CalendarTaskCard task={item} onClick={() => onTaskPress(item.task_id)} />
                </View>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        SectionSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom, flexGrow: 1 }}
        stickySectionHeadersEnabled={false}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        onScrollToIndexFailed={() => undefined}
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.green} size="large" />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center pb-20">
              <View
                className="w-14 h-14 bg-surface border-border border rounded-lg items-center justify-center mb-3"
              >
                <ClipboardList size={24} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <Text className="body-md">Ingen opgaver</Text>
              <Text className="body-xs">Der er ingen planlagte opgaver denne måned</Text>
            </View>
          )
        }
      />
    </View>
  );
});

export default CalendarAgenda;
