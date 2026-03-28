import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import MultiSelectModal from "@/components/userView/common/MultiSelectModal";
import { getUsers } from "@/lib/api";
import { assigneesStore } from "@/lib/assigneesStore";

export default function AddAssigneesPicker() {
  const router = useRouter();

  const [options, setOptions] = useState<{ label: string; value: string; subtitle?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then((users) => setOptions(users.map((u) => ({ label: u.name, value: u.user_id, subtitle: u.position ?? undefined }))))
      .catch(() => setError("Kunne ikke hente brugere"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleConfirm = (selected: string[]) => {
    assigneesStore.call(selected);
    assigneesStore.clear();
    router.back();
  };

  const handleClose = () => {
    assigneesStore.clear();
    router.back();
  };

  return (
    <MultiSelectModal
      title="Tildelt"
      options={options}
      selected={assigneesStore.getInitial()}
      onConfirm={handleConfirm}
      onClose={handleClose}
      isLoading={isLoading}
      error={error}
    />
  );
}
