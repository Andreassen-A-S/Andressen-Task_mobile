import { useLocalSearchParams, useRouter } from "expo-router";
import ListModal, { type ListModalOption } from "@/components/userView/common/ListModal";
import { pickerStore } from "@/lib/pickerStore";

export default function ListPickerScreen() {
  const router = useRouter();
  const { title, sub, optionsJson, selected } = useLocalSearchParams<{
    title: string;
    sub?: string;
    optionsJson: string;
    selected: string;
  }>();

  const options: ListModalOption[] = JSON.parse(optionsJson ?? "[]");

  const handleSelect = (value: string) => {
    pickerStore.call(value);
    pickerStore.clear();
    router.back();
  };

  return (
    <ListModal
      title={title}
      sub={sub}
      options={options}
      selected={selected}
      onSelect={handleSelect}
    />
  );
}
