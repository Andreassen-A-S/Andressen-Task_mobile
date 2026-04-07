import { Share } from "react-native";
import PathHeader from "@/components/userView/common/PathHeader";
import GlassPillButton, { type MenuAction } from "@/components/userView/common/buttons/GlassPillButton";

interface Props {
  title?: string;
  path?: string;
  menuActions?: MenuAction[];
}

export default function TaskDetailsHeader({ title, path, menuActions = [] }: Props) {
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
            ...(menuActions.length > 0 ? [{ systemName: "ellipsis" as const, menuActions }] : []),
          ]}
        />
      }
    />
  );
}
