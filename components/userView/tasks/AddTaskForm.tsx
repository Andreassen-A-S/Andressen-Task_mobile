import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { KeyboardAwareScrollView, useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { createTask } from "@/lib/api";
import { TaskPriority, TaskStatus } from "@/types/task";
import { typography } from "@/constants/typography";
import { colors } from "@/constants/colors";
import { formatRelativeDate, getPriorityAccentColor, toDateParam, parseDateParam, translatePriority, translateTaskUnit } from "@/helpers/helpers";
import { pickerStore } from "@/lib/pickerStore";
import { assigneesStore } from "@/lib/assigneesStore";
import { goalStore, type GoalData } from "@/lib/goalStore";
import ToolbarGlassButton from "@/components/userView/common/buttons/ToolbarGlassButton";
import GlassTextButton from "@/components/userView/common/buttons/GlassTextButton";
import ModalScreen from "@/components/userView/common/ModalScreen";
import PathHeader, { usePathHeaderHeight } from "@/components/userView/common/PathHeader";
import { type ListModalOption } from "@/components/userView/common/ListModal";


const PRIORITY_OPTIONS: ListModalOption[] = [
  { label: "Lav", value: TaskPriority.LOW, accent: getPriorityAccentColor(TaskPriority.LOW) },
  { label: "Mellem", value: TaskPriority.MEDIUM, accent: getPriorityAccentColor(TaskPriority.MEDIUM) },
  { label: "Høj", value: TaskPriority.HIGH, accent: getPriorityAccentColor(TaskPriority.HIGH) },
];


export default function AddTaskForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { projectId, projectName } = useLocalSearchParams<{ projectId: string; projectName: string }>();
  const insets = useSafeAreaInsets();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  const headerHeight = usePathHeaderHeight(true);
  const toolbarHeight = 44 + insets.bottom;

  const toolbarStyle = useAnimatedStyle(() => ({
    marginBottom: -keyboardHeight.value - 12,
  }));

  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const lastFocusedRef = useRef<"title" | "description">("title");

  useEffect(() => {
    const timer = setTimeout(() => titleRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  useFocusEffect(useCallback(() => {
    const ref = lastFocusedRef.current === "description" ? descriptionRef : titleRef;
    const timer = setTimeout(() => ref.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting || !user) return;
    if (!projectId) {
      setError("Intet projekt valgt. Luk og prøv igen.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        project_id: projectId,
        priority,
        status: TaskStatus.PENDING,
        deadline: toDateParam(deadline ?? new Date()),
        scheduled_date: toDateParam(scheduledDate ?? new Date()),
        created_by: user.user_id,
        assigned_users: assignedUsers,
        ...(goal ? { goal_type: goal.goal_type, target_quantity: goal.target_quantity, unit: goal.unit } : {}),
      });
      router.dismissAll();
    } catch {
      setError("Kunne ikke oprette opgaven. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPicker = (
    title: string,
    options: ListModalOption[],
    selected: string,
    onSelect: (value: string) => void,
  ) => {
    pickerStore.set(onSelect);
    router.push({
      pathname: "/(tabs)/tasks/list-picker",
      params: { title, optionsJson: JSON.stringify(options), selected },
    });
  };


  return (
    <ModalScreen
      header={
        <PathHeader
          modal
          title="Tilføj en ny opgave"
          path={projectName}
          rightContent={<GlassTextButton variant={title.trim() ? "active" : "inactive"} label="Tilføj" onPress={handleSubmit} />}
        />
      }
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: headerHeight + 16, paddingHorizontal: 16, paddingBottom: toolbarHeight + 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bottomOffset={toolbarHeight}
      >
        <TextInput
          ref={titleRef}
          value={title}
          onChangeText={setTitle}
          onFocus={() => { lastFocusedRef.current = "title"; }}
          placeholder="Titel"
          placeholderTextColor={colors.textMuted}
          style={[typography.h3, { color: colors.textPrimary, marginBottom: 22 }]}
          multiline
        />
        <TextInput
          ref={descriptionRef}
          value={description}
          onChangeText={setDescription}
          onFocus={() => { lastFocusedRef.current = "description"; }}
          placeholder="Tilføj en beskrivelse"
          placeholderTextColor={colors.textMuted}
          style={[typography.bodyMd, { color: colors.textPrimary, minHeight: 250 }]}
          multiline
          scrollEnabled={false}
          autoCorrect={true}
          spellCheck={true}
        />
        {error ? (
          <View style={{
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
      </KeyboardAwareScrollView>


      <Animated.View style={[{ height: toolbarHeight }, toolbarStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8, alignItems: 'center', flex: 1 }}
        >
          <ToolbarGlassButton icon="flag" label={translatePriority(priority).charAt(0) + translatePriority(priority).slice(1).toLowerCase()} tint={priority ? "#007AFF" : undefined} onPress={() => openPicker("Prioritet", PRIORITY_OPTIONS, priority, (v) => setPriority(v as TaskPriority))} />
          <ToolbarGlassButton icon="calendar" label={scheduledDate ? formatRelativeDate(scheduledDate) : "Planlagt"} tint={scheduledDate ? "#007AFF" : undefined} onPress={() => { pickerStore.set((v) => setScheduledDate(v ? parseDateParam(v) : null)); router.push({ pathname: "/(tabs)/tasks/date-picker", params: { title: "Planlagt dato", selected: toDateParam(scheduledDate ?? new Date()) } }); }} />
          <ToolbarGlassButton icon="clock" label={deadline ? formatRelativeDate(deadline) : "Deadline"} tint={deadline ? "#007AFF" : undefined} onPress={() => { pickerStore.set((v) => setDeadline(v ? parseDateParam(v) : null)); router.push({ pathname: "/(tabs)/tasks/date-picker", params: { title: "Deadline", selected: toDateParam(deadline ?? new Date()) } }); }} />
          <ToolbarGlassButton icon="target" label={goal?.target_quantity ? translateTaskUnit(goal.unit).replace(/^./, (c) => c.toUpperCase()) : "Mål"} tint={goal ? "#007AFF" : undefined} onPress={() => { goalStore.set(setGoal, goal); router.push({ pathname: "/(tabs)/tasks/add-goal-picker" }); }} />
          <ToolbarGlassButton icon="person" label={assignedUsers.length > 0 ? `${assignedUsers.length} Tildelt${assignedUsers.length === 1 ? "" : "e"}` : "Tildelte"} tint={assignedUsers.length > 0 ? "#007AFF" : undefined} onPress={() => { assigneesStore.set(setAssignedUsers, assignedUsers); router.push({ pathname: "/(tabs)/tasks/add-assignees-picker" }); }} />
        </ScrollView>
      </Animated.View>
    </ModalScreen>
  );
}
