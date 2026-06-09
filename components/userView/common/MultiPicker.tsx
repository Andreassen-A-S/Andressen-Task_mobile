import { memo, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  type FlatListProps,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, CirclePlus, XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

import ModalScreen, {
  useCompactingModalHeader,
  useModalHeaderHeight,
} from "@/components/userView/common/ModalScreen";
import GlassIconButton from "@/components/userView/common/buttons/GlassIconButton";
import SearchBarOverlay from "@/components/userView/common/SearchBarOverlay";
import SingleAvatar from "@/components/userView/common/label/singleAvatar";
import ProjectAvatar from "@/components/userView/common/label/ProjectAvatar";
import { multiSelectStore } from "@/lib/multiSelectStore";
import { colors } from "@/constants/colors";

const SEARCHBAR_HEIGHT = Platform.OS === "ios" ? 56 : 64;

const ROW_ENTER_DURATION = 220;
const ROW_EXIT_DURATION = 180;
const ICON_ENTER_DURATION = 140;
const ICON_EXIT_DURATION = 180;
const EMPTY_ENTER_DURATION = 220;
const EMPTY_EXIT_DURATION = 180;

const layoutTransition = LinearTransition.springify()
  .damping(22)
  .stiffness(190)
  .mass(0.75);

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

type HeaderItem = {
  type: "header";
  id: "selected-header";
  title: string;
};

type EmptyItem = {
  type: "empty";
  id: "selected-empty" | "unselected-empty";
  text: string;
};

type SpacerItem = {
  type: "spacer";
  id: "section-spacer";
};

type OptionItem = {
  type: "option";
  id: string;
  option: MultiSelectOption;
  selected: boolean;
  showSeparator: boolean;
};

type ListItem = HeaderItem | EmptyItem | SpacerItem | OptionItem;

type AnimatedFlatListProps = FlatListProps<ListItem> & {
  itemLayoutAnimation?: unknown;
};

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList
) as ComponentType<AnimatedFlatListProps>;

function buildItems({
  options,
  selectedValues,
  selectedSet,
  search,
}: {
  options: MultiSelectOption[];
  selectedValues: string[];
  selectedSet: Set<string>;
  search: string;
}): ListItem[] {
  const normalizedSearch = search.trim().toLowerCase();

  const optionByValue = new Map(
    options.map((option) => [option.value, option])
  );

  /**
   * Important:
   * Selected options are built from selectedValues, not options.
   * This means the latest selected item is appended to the bottom.
   */
  const selectedOptions = selectedValues
    .map((value) => optionByValue.get(value))
    .filter((option): option is MultiSelectOption => Boolean(option));

  const unselectedOptions = options.filter((option) => {
    if (selectedSet.has(option.value)) return false;
    if (!normalizedSearch) return true;

    return (
      option.label.toLowerCase().includes(normalizedSearch) ||
      option.subtitle?.toLowerCase().includes(normalizedSearch)
    );
  });

  const selectedItems: ListItem[] =
    selectedOptions.length > 0
      ? selectedOptions.map<ListItem>((option, i) => ({
        type: "option",
        id: `selected-${option.value}`,
        option,
        selected: true,
        showSeparator: i > 0,
      }))
      : [
        {
          type: "empty",
          id: "selected-empty",
          text: "Ingen valgt",
        } satisfies EmptyItem,
      ];

  const unselectedItems: ListItem[] =
    unselectedOptions.length > 0
      ? unselectedOptions.map<ListItem>((option, i) => ({
        type: "option",
        id: `unselected-${option.value}`,
        option,
        selected: false,
        showSeparator: i > 0,
      }))
      : [
        {
          type: "empty",
          id: "unselected-empty",
          text: "Ingen resultater",
        } satisfies EmptyItem,
      ];

  return [
    {
      type: "header",
      id: "selected-header",
      title: "Valgte",
    },
    ...selectedItems,
    {
      type: "spacer",
      id: "section-spacer",
    },
    ...unselectedItems,
  ];
}

const MultiPickerRow = memo(function MultiPickerRow({
  item,
  onPress,
}: {
  item: OptionItem;
  onPress: () => void;
}) {
  const option = item.option;

  return (
    <Animated.View
      layout={layoutTransition}
      entering={FadeIn.duration(ROW_ENTER_DURATION)}
      exiting={FadeOut.duration(ROW_EXIT_DURATION)}
      className="bg-surface"
      style={{
        position: "relative",
        zIndex: 1,
        elevation: 1,
      }}
    >
      {item.showSeparator && <View className="h-px bg-border ml-[68px]" />}

      <TouchableOpacity
        activeOpacity={0.65}
        onPress={onPress}
        className="flex-row items-center px-4 py-3"
      >
        <View className="mr-4">
          {option.color ? (
            <ProjectAvatar
              name={option.label}
              color={option.color}
              size="sm"
            />
          ) : (
            <SingleAvatar
              name={option.label}
              imageUrl={option.imageUrl}
              size="lg"
            />
          )}
        </View>

        <View className="flex-1">
          <Text className="h6" numberOfLines={1}>
            {option.label}
          </Text>

          {option.subtitle ? (
            <Text className="body-xs" numberOfLines={1}>
              {option.subtitle}
            </Text>
          ) : null}
        </View>

        <Animated.View
          key={item.selected ? "remove-icon" : "add-icon"}
          entering={FadeIn.duration(ICON_ENTER_DURATION)}
          exiting={FadeOut.duration(ICON_EXIT_DURATION)}
        >
          {item.selected ? (
            <XCircle size={22} color={colors.textMuted} strokeWidth={2} />
          ) : (
            <CirclePlus size={22} color={colors.green} strokeWidth={2} />
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function MultiPicker({
  title,
  options,
  isLoading,
  error,
  searchable = true,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useModalHeaderHeight(true);

  const {
    headerStyle,
    headerPointerEvents,
    spacerStyle,
    handleFocusChange,
  } = useCompactingModalHeader(headerHeight);

  const [selected, setSelected] = useState<string[]>(
    multiSelectStore.getInitial()
  );

  const [search, setSearch] = useState("");

  useEffect(() => {
    return () => multiSelectStore.clear();
  }, []);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const items = useMemo(
    () =>
      buildItems({
        options,
        selectedValues: selected,
        selectedSet,
        search,
      }),
    [options, selected, selectedSet, search]
  );

  const toggle = (value: string) => {
    setSelected((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }

      /**
       * Appending here makes the latest selected item appear
       * at the bottom of the selected section.
       */
      return [...prev, value];
    });
  };

  const handleConfirm = () => {
    multiSelectStore.call(selected);
    multiSelectStore.clear();
    router.back();
  };

  const handleClose = () => {
    multiSelectStore.clear();
    router.back();
  };

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    if (item.type === "header") {
      return (
        <View
          className="px-4 pb-2 bg-background"
          style={{
            position: "relative",
            zIndex: 0,
            elevation: 0,
          }}
        >
          <Text className="body-md font-semibold !text-secondary">
            {item.title}
          </Text>
        </View>
      );
    }

    if (item.type === "spacer") {
      return (
        <View
          className="h-4 bg-background"
          style={{
            position: "relative",
            zIndex: 0,
            elevation: 0,
          }}
        />
      );
    }

    if (item.type === "empty") {
      return (
        <Animated.View
          layout={layoutTransition}
          entering={FadeIn.duration(EMPTY_ENTER_DURATION)}
          exiting={FadeOut.duration(EMPTY_EXIT_DURATION)}
          className="px-4 py-3.5 bg-surface"
          style={{
            position: "relative",
            zIndex: 1,
            elevation: 1,
          }}
        >
          <Text className="body-md !text-secondary">{item.text}</Text>
        </Animated.View>
      );
    }

    return (
      <MultiPickerRow
        item={item}
        onPress={() => toggle(item.option.value)}
      />
    );
  };

  return (
    <ModalScreen
      title={title}
      onClose={handleClose}
      headerStyle={headerStyle}
      headerPointerEvents={headerPointerEvents}
      rightContent={
        <GlassIconButton
          variant="active"
          size="lg"
          icon={Check}
          onPress={handleConfirm}
        />
      }
    >
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
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
            <AnimatedFlatList
              data={items}
              extraData={selected}
              keyExtractor={(item) => item.id}
              itemLayoutAnimation={layoutTransition}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
              contentContainerStyle={{
                paddingBottom: searchable
                  ? SEARCHBAR_HEIGHT + 20 + 16
                  : insets.bottom + 16,
              }}
            />
          )}

          {searchable && (
            <SearchBarOverlay
              onChangeText={setSearch}
              onFocusChange={handleFocusChange}
              bottomInset={20}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </ModalScreen>
  );
}