import { useAuth } from "@/hooks/useAuth";
import { isAdminRole } from "@/types/users";
import AdminTaskPage from "@/components/userView/tasks/AdminTaskPage";
import UserTaskPage from "@/components/userView/tasks/UserTaskPage";

export default function TasksPage() {
  const { userRole } = useAuth();
  return isAdminRole(userRole) ? <AdminTaskPage /> : <UserTaskPage />;
}
