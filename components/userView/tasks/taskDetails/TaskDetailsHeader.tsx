import { Share, Alert } from "react-native";
import PathHeader from "@/components/userView/common/PathHeader";
import GlassPillButton from "@/components/userView/common/buttons/GlassPillButton";

interface Props {
  title?: string;
  path?: string;
}

export default function TaskDetailsHeader({ title, path }: Props) {
  return (
    <PathHeader
      title={title}
      path={path ?? "Andreassen-A-S"}
      rightContent={
        <GlassPillButton
          variant="lg"
          items={[
            { systemName: "square.and.arrow.up", onPress: async () => { if (title) await Share.share({ message: title }); } },
            { systemName: "ellipsis", onPress: () => Alert.alert("Mere", "Kommer snart") },
          ]}
        />
      }
    />
  );
}
