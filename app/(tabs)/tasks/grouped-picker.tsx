import { useLocalSearchParams } from "expo-router";
import GroupedSelectModal, { type GroupedSelectGroup } from "@/components/userView/common/GroupedSelectModal";

export default function GroupedPickerScreen() {
  const { title, groupsJson, selected } = useLocalSearchParams<{ title: string; groupsJson: string; selected: string }>();

  let groups: GroupedSelectGroup[] = [];
  try {
    groups = JSON.parse(groupsJson ?? "[]");
  } catch {}

  return <GroupedSelectModal title={title} groups={groups} selected={selected} />;
}
