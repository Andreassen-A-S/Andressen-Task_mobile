import { useLocalSearchParams } from "expo-router";
import TaskComments from "@/components/userView/tasks/taskDetails/TaskComments";

export default function TaskCommentsScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  return <TaskComments taskId={taskId} />;
}
