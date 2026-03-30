import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import ClearButton from "@/components/userView/common/buttons/ClearButton";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

const DAY_LABELS = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];
const MONTH_LABELS = [
  "Januar", "Februar", "Marts", "April", "Maj", "Juni",
  "Juli", "August", "September", "Oktober", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

interface Props {
  title: string;
  value: Date | null;
  onConfirm: (date: Date | null) => void;
  onClose: () => void;
}

export default function DateSelectModal({ title, value, onConfirm, onClose }: Props) {
  const headerHeight = useModalHeaderHeight();
  const today = new Date();
  const initial = value ?? today;

  const [selected, setSelected] = useState<Date>(initial);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(getFirstWeekday(viewYear, viewMonth)).fill(null),
    ...Array.from({ length: getDaysInMonth(viewYear, viewMonth) }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (day: number) =>
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  return (
    <ModalScreen
      title={title}
      onClose={onClose}
      rightContent={
        <GlassIconButton systemName="checkmark" onPress={() => onConfirm(selected)} size="lg" variant="active" />
      }
    >
      <View style={{ paddingTop: headerHeight + 16 }}>
        {/* Month navigator */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 }}>
          <TouchableOpacity onPress={prevMonth} hitSlop={16}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={typography.h6}>{MONTH_LABELS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth} hitSlop={16}>
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View style={{ flexDirection: "row", paddingHorizontal: 8, marginBottom: 4 }}>
          {DAY_LABELS.map(d => (
            <View key={d} style={{ flex: 1, alignItems: "center" }}>
              <Text style={[typography.bodyXs, { color: colors.textMuted }]}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Day grid */}
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <View key={row} style={{ flexDirection: "row", paddingHorizontal: 8 }}>
            {cells.slice(row * 7, row * 7 + 7).map((day, col) => (
              <View key={col} style={{ flex: 1, alignItems: "center", paddingVertical: 3 }}>
                {day ? (
                  <TouchableOpacity
                    onPress={() => setSelected(new Date(viewYear, viewMonth, day))}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected(day) ? colors.green : "transparent",
                      borderWidth: isToday(day) && !isSelected(day) ? 1 : 0,
                      borderColor: colors.green,
                    }}
                  >
                    <Text style={[
                      typography.bodySm,
                      { color: isSelected(day) ? colors.white : isToday(day) ? colors.green : colors.textPrimary },
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        ))}

        <View style={{ alignItems: "center", marginTop: 16 }}>
          <ClearButton label="Ryd dato" onPress={() => onConfirm(null)} />
        </View>
      </View>
    </ModalScreen>
  );
}
