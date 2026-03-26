import { useLocalSearchParams } from "expo-router";
import UserTaskDetails from "@/components/userView/tasks/taskDetails/UserTaskDetails";

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  return <UserTaskDetails taskId={taskId} />;
}
