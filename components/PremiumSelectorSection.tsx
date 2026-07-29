import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

import PremiumSelectorCard from "./PremiumSelectorCard";
import { mockBrands, mockCategories } from "@/lib/mockData";
import { Colors, Spacing, Typography } from "@/constants/theme";

type SelectorType = "brand" | "category";

type PremiumSelectorSectionProps = {
  type: SelectorType;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

const categoryIcons: Record<string, { uri: string }> = {
  running: { uri: "https://cdn.simpleicons.org/nike" },
  basketball: { uri: "https://cdn.simpleicons.org/jordan" },
  lifestyle: { uri: "https://cdn.simpleicons.org/vans" },
  training: { uri: "https://cdn.simpleicons.org/reebok" },
  luxury: { uri: "https://cdn.simpleicons.org/gucci" },
};

export default function PremiumSelectorSection({
  type,
  selectedId,
  onSelect,
}: PremiumSelectorSectionProps) {
  const isAllSelected = selectedId === null;

  const handlePress = useCallback(
    (id: string) => {
      if (id === "__all__") {
        onSelect(null);
      } else {
        onSelect(selectedId === id ? null : id);
      }
    },
    [selectedId, onSelect],
  );

  const renderItem = useCallback(
    ({
      item,
    }: {
      item: { id: string; name: string; thumb?: string | null };
    }) => {
      const isSelected = selectedId === item.id;
      const imageUrl =
        type === "category"
          ? categoryIcons[item.id]?.uri || null
          : item.thumb || null;

      return (
        <PremiumSelectorCard
          id={item.id}
          label={item.name}
          imageUrl={imageUrl}
          isSelected={isSelected}
          onPress={handlePress}
          noBackground
        />
      );
    },
    [type, selectedId, handlePress],
  );

  const title = type === "brand" ? "Brands" : "Categories";
  const data = type === "brand" ? mockBrands : mockCategories;
  const initialNumToRender = type === "brand" ? 6 : 5;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.light.tint }]}>
        {title}
      </Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
        ListHeaderComponent={
          <PremiumSelectorCard
            id="__all__"
            label="All"
            imageUrl={null}
            isSelected={isAllSelected}
            onPress={handlePress}
            noBackground
          />
        }
        getItemLayout={(_, index) => ({
          length: 84,
          offset: 84 * (index + 1),
          index,
        })}
        windowSize={5}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        initialNumToRender={initialNumToRender}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    lineHeight: Typography.sectionTitle.lineHeight,
    letterSpacing: Typography.sectionTitle.letterSpacing,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    alignItems: "center",
  },
});
