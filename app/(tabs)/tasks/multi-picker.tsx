import { useLocalSearchParams } from "expo-router";
import MultiPicker, { type MultiSelectOption } from "@/components/userView/common/MultiPicker";

export default function MultiPickerScreen() {
  const { title, optionsJson } = useLocalSearchParams<{ title: string; optionsJson: string }>();

  let options: MultiSelectOption[] = [];
  try {
    options = JSON.parse(optionsJson ?? "[]");
  } catch {}

  return <MultiPicker title={title} options={options} />;
}
