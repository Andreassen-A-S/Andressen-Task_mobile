import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { createTask } from "@/lib/api";
import { TaskPriority, TaskStatus } from "@/types/task";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { formatRelativeDate, getPriorityColors, translatePriority } from "@/helpers/helpers";
import GlassTextButton from "@/components/userView/common/buttons/GlassTextButton";
import ModalScreen, { useModalHeaderHeight } from "@/components/userView/common/ModalScreen";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateParam(date: Date): string {
  return date.toISOString().split("T")[0];
}

const DATE_OFFSETS = [0, 0, 1, 3, 7];

export default function AddTaskForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { projectId, projectName } = useLocalSearchParams<{ projectId: string; projectName: string }>();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [deadline, setDeadline] = useState(addDays(new Date(), 7));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting || !user) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        project_id: projectId,
        priority,
        status: TaskStatus.PENDING,
        deadline: toDateParam(deadline),
        scheduled_date: toDateParam(scheduledDate),
        created_by: user.user_id,
        assigned_users: [],
      });
      router.dismiss(2);
    } catch {
      setError("Kunne ikke oprette opgaven. Prøv igen.");
      setIsSubmitting(false);
    }
  };

  const showPriorityPicker = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Annuller", "Lav", "Medium", "Høj"], cancelButtonIndex: 0 },
        (index) => {
          if (index === 1) setPriority(TaskPriority.LOW);
          if (index === 2) setPriority(TaskPriority.MEDIUM);
          if (index === 3) setPriority(TaskPriority.HIGH);
        },
      );
    } else {
      Alert.alert("Prioritet", "", [
        { text: "Lav", onPress: () => setPriority(TaskPriority.LOW) },
        { text: "Medium", onPress: () => setPriority(TaskPriority.MEDIUM) },
        { text: "Høj", onPress: () => setPriority(TaskPriority.HIGH) },
        { text: "Annuller", style: "cancel" },
      ]);
    }
  };

  const showDatePicker = (field: "scheduled" | "deadline") => {
    const today = new Date();
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Annuller", "I dag", "I morgen", "Om 3 dage", "Om en uge"], cancelButtonIndex: 0 },
        (index) => {
          if (index === 0) return;
          const date = addDays(today, DATE_OFFSETS[index]);
          if (field === "scheduled") setScheduledDate(date);
          else setDeadline(date);
        },
      );
    }
  };

  const priorityColors = getPriorityColors(priority);

  return (
    <ModalScreen
      title="Tilføj en ny opgave"
      rightContent={<GlassTextButton label="Tilføj" onPress={handleSubmit} />}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: headerHeight + 16, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Text style={[typography.labelSmUppercase]}>{projectName}</Text>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Opgavetitel..."
              placeholderTextColor={colors.textMuted}
              style={[typography.h5, { color: colors.textPrimary }]}
              autoFocus
            />
          </View>
          <View style={{
            height: 1,
            marginHorizontal: 16,
            marginVertical: 12,
            backgroundColor: colors.border,
          }} />
          <View style={{ paddingHorizontal: 16 }}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tilføj en beskrivelse..."
              placeholderTextColor={colors.textMuted}
              style={[typography.bodyMd, { color: colors.textPrimary, minHeight: 80 }]}
              multiline
              textAlignVertical="top"
            />
          </View>
          {error ? (
            <View style={{
              marginHorizontal: 16,
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.redLight,
              borderWidth: 1,
              borderColor: colors.redBorder,
            }}>
              <Text style={[typography.bodySm, { color: colors.redText }]}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Bottom toolbar */}
        <View style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        }}>
          <TouchableOpacity
            onPress={showPriorityPicker}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              ...priorityColors.container,
            }}
          >
            <Ionicons name="flag-outline" size={13} color={priorityColors.text.color as string} />
            <Text style={[typography.btnSm, priorityColors.text]}>{translatePriority(priority)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => showDatePicker("scheduled")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.white,
            }}
          >
            <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
            <Text style={[typography.btnSm, { color: colors.textSecondary }]}>
              {formatRelativeDate(scheduledDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => showDatePicker("deadline")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.white,
            }}
          >
            <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
            <Text style={[typography.btnSm, { color: colors.textSecondary }]}>
              {formatRelativeDate(deadline)}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
