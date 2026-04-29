import { Platform, Share } from "react-native";
import PathHeader from "@/components/userView/common/PathHeader";
import GlassPillButton from "@/components/userView/common/buttons/GlassPillButton";
import { MenuAction } from "@/types/pill";

interface Props {
  title?: string;
  path?: string;
  taskId?: string;
  menuActions?: MenuAction[];
}

export default function TaskDetailsHeader({ title, path, taskId, menuActions = [] }: Props) {
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
                if (!taskId) return;
                const url = `andreassentask://tasks?taskId=${taskId}`;
                await Share.share(
                  Platform.OS === "ios"
                    ? { url, message: title ?? "" }
                    : { message: title ? `${title}\n${url}` : url },
                );
              },
            },
            ...(menuActions.length > 0 ? [{ systemName: "ellipsis" as const, menuActions }] : []),
          ]}
        />
      }
    />
  );
}
