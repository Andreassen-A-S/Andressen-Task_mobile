import { SFSymbol } from "sf-symbols-typescript";

export interface MenuAction {
  label: string;
  systemImage?: SFSymbol;
  onPress: () => void;
  role?: "destructive";
}

export interface PillItem {
  systemName: SFSymbol;
  onPress?: () => void;
  menuActions?: MenuAction[];
}
