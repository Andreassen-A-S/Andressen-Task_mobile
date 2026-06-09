import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { KeyboardAwareScrollView, KeyboardAvoidingView, useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { createTask } from "@/lib/api";
import { TaskPriority, TaskStatus } from "@/types/task";
import { colors } from "@/constants/colors";
import { formatRelativeDate, toDateKey, toIsoDate, parseDateParam, translatePriority, translateTaskUnit } from "@/helpers/helpers";
import { pickerStore } from "@/lib/pickerStore";
import { multiSelectStore } from "@/lib/multiSelectStore";
import { goalStore, GoalData } from "@/lib/goalStore";
import { Calendar, Clock, Flag, Target, UserRound } from "lucide-react-native";
import ToolbarGlassButton from "@/components/userView/common/buttons/ToolbarGlassButton";
import GlassTextButton from "@/components/userView/common/buttons/GlassTextButton";
import ModalScreen from "@/components/userView/common/ModalScreen";
import KeyboardSafeAreaSpacer from "@/components/userView/common/KeyboardSafeAreaSpacer";
import PathHeader, { usePathHeaderHeight } from "@/components/userView/common/PathHeader";
import { ListModalOption } from "@/types/picker";
import Badge from "@/components/userView/common/label/badge";

const PRIORITY_OPTIONS: ListModalOption[] = [
  { value: TaskPriority.LOW, icon: <Badge variant="priority" value={TaskPriority.LOW} size="lg" /> },
  { value: TaskPriority.MEDIUM, icon: <Badge variant="priority" value={TaskPriority.MEDIUM} size="lg" /> },
  { value: TaskPriority.HIGH, icon: <Badge variant="priority" value={TaskPriority.HIGH} size="lg" /> },
];

const TOOLBAR_HEIGHT = 44;
const TOOLBAR_KEYBOARD_GAP = 8;

export default function AddTaskForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { projectId, projectName } = useLocalSearchParams<{ projectId: string; projectName: string }>();
  const insets = useSafeAreaInsets();
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  const headerHeight = usePathHeaderHeight(true);
  const iosToolbarHeight = TOOLBAR_HEIGHT + insets.bottom;

  const iosToolbarStyle = useAnimatedStyle(() => ({
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
  const [startDate, setStartDate] = useState<Date | null>(null);
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
        deadline: toIsoDate(toDateKey(deadline ?? startDate ?? new Date())),
        start_date: toIsoDate(toDateKey(startDate ?? new Date())),
        created_by: user.user_id,
        assigned_users: assignedUsers,
        ...(goal ? { goal: { target_quantity: goal.target_quantity, unit: goal.unit, current_quantity: goal.current_quantity } } : {}),
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
    pickerStore.set(onSelect, options);
    router.push({
      pathname: "/(tabs)/tasks/list-picker",
      params: { title, selected },
    });
  };

  const formFields = (
    <>
      <TextInput
        ref={titleRef}
        value={title}
        onChangeText={setTitle}
        onFocus={() => { lastFocusedRef.current = "title"; }}
        underlineColorAndroid="transparent"
        placeholder="Titel"
        placeholderTextColor={colors.textMuted}
        className="h3"
        style={{ marginBottom: 22, padding: 0 }}
        multiline
      />
      <TextInput
        ref={descriptionRef}
        value={description}
        onChangeText={setDescription}
        onFocus={() => { lastFocusedRef.current = "description"; }}
        underlineColorAndroid="transparent"
        placeholder="Tilføj en beskrivelse"
        placeholderTextColor={colors.textMuted}
        className="body-md"
        style={{ minHeight: 250, padding: 0, textAlignVertical: "top" }}
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
          <Text className="body-sm text-danger-text">{error}</Text>
        </View>
      ) : null}
    </>
  );

  const toolbarButtons = (
    <>
      <ToolbarGlassButton icon={Flag} label={translatePriority(priority).charAt(0) + translatePriority(priority).slice(1).toLowerCase()} tint={priority ? "#007AFF" : undefined} onPress={() => openPicker("Prioritet", PRIORITY_OPTIONS, priority, (v) => setPriority(v as TaskPriority))} />
      <ToolbarGlassButton icon={Calendar} label={startDate ? formatRelativeDate(startDate) : "Startdato"} tint={startDate ? "#007AFF" : undefined} onPress={() => { pickerStore.set((v) => setStartDate(v ? parseDateParam(v) : null)); router.push({ pathname: "/(tabs)/tasks/date-picker", params: { title: "Startdato", selected: startDate ? toDateKey(startDate) : "" } }); }} />
      <ToolbarGlassButton icon={Clock} label={deadline ? formatRelativeDate(deadline) : "Deadline"} tint={deadline ? "#007AFF" : undefined} onPress={() => { pickerStore.set((v) => setDeadline(v ? parseDateParam(v) : null)); router.push({ pathname: "/(tabs)/tasks/date-picker", params: { title: "Deadline", selected: deadline ? toDateKey(deadline) : "" } }); }} />
      <ToolbarGlassButton icon={Target} label={goal?.target_quantity ? translateTaskUnit(goal.unit).replace(/^./, (c) => c.toUpperCase()) : "Mål"} tint={goal ? "#007AFF" : undefined} onPress={() => { goalStore.set(setGoal, goal); router.push({ pathname: "/(tabs)/tasks/add-goal-picker" }); }} />
      <ToolbarGlassButton icon={UserRound} label={assignedUsers.length > 0 ? `${assignedUsers.length} Tildelt${assignedUsers.length === 1 ? "" : "e"}` : "Tildelte"} tint={assignedUsers.length > 0 ? "#007AFF" : undefined} onPress={() => { multiSelectStore.set(setAssignedUsers, assignedUsers); router.push({ pathname: "/(tabs)/tasks/add-assignees-picker" }); }} />
    </>
  );

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
      {Platform.OS === "ios" ? (
        <>
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: headerHeight + 16, paddingHorizontal: 16, paddingBottom: iosToolbarHeight + 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            bottomOffset={iosToolbarHeight}
          >
            {formFields}
          </KeyboardAwareScrollView>

          <Animated.View style={[{ height: iosToolbarHeight }, iosToolbarStyle]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{ paddingHorizontal: 12, gap: 8, alignItems: "center" }}
            >
              {toolbarButtons}
            </ScrollView>
          </Animated.View>
        </>
      ) : (
        <>
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={0}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingTop: headerHeight + 16, paddingHorizontal: 16, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
            >
              {formFields}
            </ScrollView>

            <View style={{ height: TOOLBAR_HEIGHT }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                contentContainerStyle={{ paddingHorizontal: 12, gap: 8, alignItems: "center" }}
              >
                {toolbarButtons}
              </ScrollView>
            </View>
            <KeyboardSafeAreaSpacer bottomInset={0} keyboardGap={TOOLBAR_KEYBOARD_GAP} />
          </KeyboardAvoidingView>
          <KeyboardSafeAreaSpacer bottomInset={insets.bottom} />
        </>
      )}
    </ModalScreen>
  );
}
