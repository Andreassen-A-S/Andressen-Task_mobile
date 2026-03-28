import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ListModal, { type ListModalOption } from "@/components/userView/common/ListModal";
import { pickerStore } from "@/lib/pickerStore";

export default function ListPicker() {
  const router = useRouter();
  const { title, sub, optionsJson, selected, searchable } = useLocalSearchParams<{
    title: string;
    sub?: string;
    optionsJson: string;
    selected: string;
    searchable?: string;
  }>();

  useEffect(() => () => pickerStore.clear(), []);

  let options: ListModalOption[] = [];
  try {
    options = JSON.parse(optionsJson ?? "[]");
  } catch {}

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
      searchable={searchable === "true"}
    />
  );
}
