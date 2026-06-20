import { useState, useRef, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions } from "react-native";
import { Check, ChevronLeft, ChevronRight } from "lucide-react-native";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import ClearButton from "@/components/userView/common/buttons/ClearButton";
import { colors } from "@/constants/colors";
import { getMonthStart, addMonths, getMonthDiff, YEAR_RANGE, getDaysInMonth } from "@/components/userView/calendar/calendarUtils";

const MONTH_COUNT = YEAR_RANGE * 12 * 2 + 1;
const DAY_LABELS = ["MAN.", "TIRS.", "ONS.", "TORS.", "FRE.", "LØR.", "SØN."];
const MONTH_LABELS = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];
const TODAY = new Date().toDateString();
const CALENDAR_BODY_HEIGHT = 276;

interface Props {
  title: string;
  value: Date | null;
  onConfirm: (date: Date | null) => void;
  onClose: () => void;
}

export default function DateSelectModal({ title, value, onConfirm, onClose }: Props) {
  const headerHeight = useModalHeaderHeight();
  const { width } = useWindowDimensions();
  const pageWidth = width - 40;
  const listRef = useRef<FlatList<Date>>(null);

  const initial = value ?? new Date();
  const months = useMemo(() => {
    const start = addMonths(getMonthStart(initial), -YEAR_RANGE * 12);
    return Array.from({ length: MONTH_COUNT }, (_, i) => addMonths(start, i));
  }, []);
  const initialIndex = getMonthDiff(months[0], getMonthStart(initial));

  const [selected, setSelected] = useState<Date>(initial);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(initial));

  const visibleIndex = getMonthDiff(months[0], visibleMonth);
  const monthLabel = `${MONTH_LABELS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;

  const scrollTo = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), MONTH_COUNT - 1);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setVisibleMonth(months[clamped]);
  };

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.min(Math.max(Math.round(e.nativeEvent.contentOffset.x / pageWidth), 0), MONTH_COUNT - 1);
    setVisibleMonth(months[index]);
  }, [months, pageWidth]);

  const renderMonth = useCallback(({ item: month }: { item: Date }) => {
    const days = getDaysInMonth(month);
    const rows = Array.from({ length: days.length / 7 }, (_, r) => days.slice(r * 7, r * 7 + 7));

    return (
      <View style={{ width: pageWidth, height: CALENDAR_BODY_HEIGHT }}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} className="flex-1 flex-row px-2 pb-2">
            {row.map(({ date, isCurrentMonth }, col) => {
              const isSelected = isCurrentMonth && date.toDateString() === selected.toDateString();
              const isToday = isCurrentMonth && date.toDateString() === TODAY;
              return (
                <View key={col} className="flex-1 items-center justify-center">
                  {isCurrentMonth && (
                    <TouchableOpacity
                      onPress={() => setSelected(date)}
                      style={{
                        width: 44, height: 44, borderRadius: 999,
                        alignItems: "center", justifyContent: "center",
                        backgroundColor: isSelected && isToday ? colors.green : isSelected ? colors.green + "20" : "transparent",
                      }}
                    >
                      <Text className={`body-lg${isSelected && isToday ? " !text-white font-semibold" : isSelected ? " !text-accent font-semibold" : isToday ? " !text-accent" : ""}`}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  }, [selected, pageWidth]);

  return (
    <ModalScreen
      title={title}
      onClose={onClose}
      rightContent={<GlassIconButton icon={Check} onPress={() => onConfirm(selected)} size="lg" variant="active" />}
    >
      <View className="px-5" style={{ paddingTop: headerHeight + 16 }}>
        <View className="rounded-2xl overflow-hidden bg-surface">
          <View className="flex-row items-center justify-between px-5 my-6">
            <TouchableOpacity onPress={() => scrollTo(visibleIndex - 1)} hitSlop={16}>
              <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2.2} />
            </TouchableOpacity>
            <Text className="h6">{monthLabel}</Text>
            <TouchableOpacity onPress={() => scrollTo(visibleIndex + 1)} hitSlop={16}>
              <ChevronRight size={20} color={colors.textPrimary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <View style={{ width: pageWidth }} className="flex-row px-2 mb-1">
            {DAY_LABELS.map(d => (
              <View key={d} className="flex-1 items-center">
                <Text className="body-xs text-muted-foreground">{d}</Text>
              </View>
            ))}
          </View>

          <FlatList
            ref={listRef}
            data={months}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            keyExtractor={(m) => `${m.getFullYear()}-${m.getMonth()}`}
            renderItem={renderMonth}
            getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollToIndexFailed={({ index }) => listRef.current?.scrollToOffset({ offset: pageWidth * index, animated: false })}
            style={{ width: pageWidth, height: CALENDAR_BODY_HEIGHT }}
            bounces={false}
            removeClippedSubviews
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={3}
          />
        </View>

        <View className="self-stretch mt-4">
          <ClearButton label="Ryd dato" onPress={() => onConfirm(null)} disabled={!value} className="bg-surface" />
        </View>
      </View>
    </ModalScreen>
  );
}
