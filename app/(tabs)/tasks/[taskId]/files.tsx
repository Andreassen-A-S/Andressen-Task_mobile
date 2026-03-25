import { useLocalSearchParams } from "expo-router";
import TaskFiles from "@/components/userView/tasks/taskDetails/TaskFiles";

export default function TaskFilesScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  return <TaskFiles taskId={taskId} />;
}
