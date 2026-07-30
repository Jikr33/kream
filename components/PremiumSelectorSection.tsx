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
  showTitle?: boolean;
};

const categoryIcons: Record<string, { uri: string }> = {
  running: { uri: "https://cdn.simpleicons.org/running/111111" },
  basketball: { uri: "https://cdn.simpleicons.org/basketball/111111" },
  lifestyle: { uri: "https://cdn.simpleicons.org/shoe/111111" },
  training: { uri: "https://cdn.simpleicons.org/dumbbell/111111" },
  luxury: { uri: "https://cdn.simpleicons.org/diamond/111111" },
};

export default function PremiumSelectorSection({
  type,
  selectedId,
  onSelect,
  showTitle = true,
}: PremiumSelectorSectionProps) {
  const isAllSelected = selectedId === null;
  const isBrand = type === "brand";

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
          variant={type}
        />
      );
    },
    [type, selectedId, handlePress],
  );

  const title = isBrand ? "Brands" : "Categories";
  const data = isBrand ? mockBrands : mockCategories;
  const initialNumToRender = isBrand ? 6 : 5;
  const separatorWidth = isBrand ? Spacing.sm : Spacing.xs;

  return (
    <View style={[styles.section, isBrand && styles.brandSection]}>
      {showTitle && (
        <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
          {title}
        </Text>
      )}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          isBrand ? styles.brandListContent : styles.categoryListContent,
        ]}
        ItemSeparatorComponent={() => (
          <View style={{ width: separatorWidth }} />
        )}
        ListHeaderComponent={
          isBrand ? (
            <PremiumSelectorCard
              id="__all__"
              label="All"
              imageUrl={null}
              isSelected={isAllSelected}
              onPress={handlePress}
              variant="brand"
            />
          ) : null
        }
        getItemLayout={(_, index) => ({
          length: isBrand ? 80 : 90,
          offset: (isBrand ? 80 : 90 + separatorWidth) * index,
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
    marginBottom: Spacing.section,
  },
  brandSection: {
    marginBottom: Spacing.section,
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
  brandListContent: {
    paddingHorizontal: Spacing.md,
    alignItems: "center",
  },
  categoryListContent: {
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    flexWrap: "wrap",
  },
});
