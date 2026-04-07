import { Share } from "react-native";
import PathHeader from "@/components/userView/common/PathHeader";
import GlassPillButton from "@/components/userView/common/buttons/GlassPillButton";

interface Props {
  title?: string;
  path?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TaskDetailsHeader({ title, path, onEdit, onDelete }: Props) {
  return (
    <PathHeader
      title={title}
      path={path ?? "Andreassen-A-S"}
      rightContent={
        <GlassPillButton
          variant="lg"
          items={[
            {
              systemName: "square.and.arrow.up",
              onPress: async () => {
                if (title) await Share.share({ message: title });
              },
            },
            {
              systemName: "ellipsis",
              menuActions: [
                ...(onEdit ? [{ label: "Rediger", systemImage: "pencil" as const, onPress: onEdit }] : []),
                ...(onDelete ? [{ label: "Slet", systemImage: "trash" as const, onPress: onDelete, role: "destructive" as const }] : []),
              ],
            },
          ]}
        />
      }
    />
  );
}
