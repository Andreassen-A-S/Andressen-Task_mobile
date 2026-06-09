import { SFSymbol } from "sf-symbols-typescript";
import { type LucideIcon } from "lucide-react-native";

export interface MenuAction {
  label: string;
  systemImage?: SFSymbol;
  onPress: () => void;
  role?: "destructive";
  disabled?: boolean;
}

export interface PillItem {
  icon: LucideIcon;
  onPress?: () => void;
  menuActions?: MenuAction[];
}
