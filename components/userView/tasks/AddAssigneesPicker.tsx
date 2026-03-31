import { useState, useEffect } from "react";
import MultiPicker from "@/components/userView/common/MultiPicker";
import { getUsers } from "@/lib/api";

export default function AddAssigneesPicker() {
  const [options, setOptions] = useState<{ label: string; value: string; subtitle?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then((users) => setOptions(users.map((u) => ({ label: u.name, value: u.user_id, subtitle: u.position ?? undefined }))))
      .catch(() => setError("Kunne ikke hente brugere"))
      .finally(() => setIsLoading(false));
  }, []);

  return <MultiPicker title="Tildelt" options={options} isLoading={isLoading} error={error} />;
}
