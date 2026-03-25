import { useLocalSearchParams } from "expo-router";
import TaskPhotos from "@/components/userView/tasks/taskDetails/TaskPhotos";

export default function TaskPhotosScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  return <TaskPhotos taskId={taskId} />;
}
