import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/users";
import AdminTaskPage from "@/components/userView/tasks/AdminTaskPage";
import UserTaskPage from "@/components/userView/tasks/UserTaskPage";

export default function TasksScreen() {
  const { userRole } = useAuth();
  return userRole === UserRole.ADMIN ? <AdminTaskPage /> : <UserTaskPage />;
}
