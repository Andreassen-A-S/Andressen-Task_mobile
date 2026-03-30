import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateSelectModal from "@/components/userView/common/DateSelectModal";
import { pickerStore } from "@/lib/pickerStore";
import { toDateParam, parseDateParam } from "@/helpers/helpers";

export default function DatePicker() {
  const router = useRouter();
  const { title, selected } = useLocalSearchParams<{ title: string; selected: string }>();

  useEffect(() => () => pickerStore.clear(), []);

  const handleConfirm = (date: Date | null) => {
    pickerStore.call(date ? toDateParam(date) : "");
    pickerStore.clear();
    router.back();
  };

  const handleClose = () => {
    pickerStore.clear();
    router.back();
  };

  return (
    <DateSelectModal
      title={title}
      value={selected ? parseDateParam(selected) : null}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
}
