import { useState, useEffect } from "react";
import { Platform, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, CirclePlus, XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import ModalScreen, { useCompactingModalHeader, useModalHeaderHeight } from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import SearchBarOverlay from "@/components/userView/common/SearchBarOverlay";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";
import ProjectAvatar from "@/components/userView/common/label/ProjectAvatar";
import { multiSelectStore } from "@/lib/multiSelectStore";
import { colors } from "@/constants/colors";

const SEARCHBAR_HEIGHT = Platform.OS === "ios" ? 56 : 64;

export interface MultiSelectOption {
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
  imageUrl?: string | null;
}

interface Props {
  title: string;
  options: MultiSelectOption[];
  isLoading?: boolean;
  error?: string | null;
  searchable?: boolean;
}

export default function MultiPicker({ title, options, isLoading, error, searchable = true }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(true);
  const { headerStyle, headerPointerEvents, spacerStyle, handleFocusChange } = useCompactingModalHeader(headerHeight);

  const [selected, setSelected] = useState<string[]>(multiSelectStore.getInitial());
  const [search, setSearch] = useState("");

  useEffect(() => () => multiSelectStore.clear(), []);

  const add = (value: string) => setSelected((prev) => prev.includes(value) ? prev : [...prev, value]);
  const remove = (value: string) => setSelected((prev) => prev.filter((v) => v !== value));

  const handleConfirm = () => {
    multiSelectStore.call(selected);
    multiSelectStore.clear();
    router.back();
  };

  const handleClose = () => {
    multiSelectStore.clear();
    router.back();
  };

  const optionsByValue = new Map(options.map((o) => [o.value, o]));
  const selectedOptions = selected
    .map((value) => optionsByValue.get(value))
    .filter((o): o is MultiSelectOption => Boolean(o));
  const unselectedOptions = options.filter((o) =>
    !selected.includes(o.value) && (!search.trim() || o.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <ModalScreen
      title={title}
      onClose={handleClose}
      headerStyle={headerStyle}
      headerPointerEvents={headerPointerEvents}
      rightContent={<GlassIconButton variant="active" size="lg" icon={Check} onPress={handleConfirm} />}
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1" keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}>
        <View className="flex-1">
          <Animated.View style={spacerStyle} />
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.green} />
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="body-sm text-center">{error}</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: searchable ? SEARCHBAR_HEIGHT + 20 + 16 : insets.bottom + 16 }}
            >
              <View className="px-4 pb-2 bg-background">
                <Text className="body-md font-semibold !text-secondary">Valgte</Text>
              </View>
              {selectedOptions.length === 0 ? (
                <View>
                  <View className="px-4 py-3.5 bg-white">
                    <Text className="body-md !text-secondary">Ingen valgt</Text>
                  </View>
                </View>
              ) : selectedOptions.map((o, i) => (
                <View key={o.value}>
                  <TouchableOpacity onPress={() => remove(o.value)} className="flex-row items-center px-4 py-3 bg-white">
                    <View className="mr-4">
                      {o.color
                        ? <ProjectAvatar name={o.label} color={o.color} size="sm" />
                        : <SingleAvatar name={o.label} imageUrl={o.imageUrl} size="lg" />}
                    </View>
                    <View className="flex-1">
                      <Text className="h6" numberOfLines={1}>{o.label}</Text>
                      {o.subtitle ? <Text className="body-xs" numberOfLines={1}>{o.subtitle}</Text> : null}
                    </View>
                    <XCircle size={22} color={colors.textMuted} strokeWidth={2} />
                  </TouchableOpacity>
                  {i < selectedOptions.length - 1 && (
                    <View className="bg-white"><View className="h-px bg-border ml-[68px]" /></View>
                  )}
                </View>
              ))}

              <View className="h-4 bg-background" />

              {unselectedOptions.length === 0 ? (
                <View>
                  <View className="px-4 py-3.5 bg-white">
                    <Text className="body-md !text-secondary">Ingen resultater</Text>
                  </View>
                </View>
              ) : unselectedOptions.map((o, i) => (
                <View key={o.value}>
                  <TouchableOpacity onPress={() => add(o.value)} className="flex-row items-center px-4 py-3 bg-white">
                    <View className="mr-4">
                      {o.color
                        ? <ProjectAvatar name={o.label} color={o.color} size="sm" />
                        : <SingleAvatar name={o.label} imageUrl={o.imageUrl} size="lg" />}
                    </View>
                    <View className="flex-1">
                      <Text className="h6" numberOfLines={1}>{o.label}</Text>
                      {o.subtitle ? <Text className="body-xs" numberOfLines={1}>{o.subtitle}</Text> : null}
                    </View>
                    <CirclePlus size={22} color={colors.green} strokeWidth={2} />
                  </TouchableOpacity>
                  {i < unselectedOptions.length - 1 && (
                    <View className="bg-white"><View className="h-px bg-border ml-[68px]" /></View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
          {searchable && <SearchBarOverlay onChangeText={setSearch} onFocusChange={handleFocusChange} bottomInset={20} />}
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}
