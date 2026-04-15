import React from "react";
import { toast } from "sonner-native";
import { GlassToast } from "@/components/userView/common/GlassToast";

export function showToast({ title, message }: { title: string; message: string }) {
  let id: string | number;
  id = toast.custom(
    React.createElement(GlassToast, {
      title,
      message,
      onDismiss: () => toast.dismiss(id),
    }),
    { duration: 4000 },
  );
  return id;
}
