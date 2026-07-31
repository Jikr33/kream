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
  const initialNumToRender = isBrand ? 10 : 5;

  return (
    <View style={[styles.section, isBrand && styles.brandSection]}>
      {showTitle && (
        <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
          {title}
        </Text>
      )}
      <FlatList
        data={isBrand ? data : data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => {
          const chipWidth = isBrand ? 54 : 80;
          const gap = isBrand ? 12 : 8;
          return {
            length: chipWidth,
            offset: (chipWidth + gap) * index,
            index,
          };
        }}
        windowSize={5}
        maxToRenderPerBatch={12}
        removeClippedSubviews
        initialNumToRender={isBrand ? 10 : 5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 16,
    marginBottom: 16,
  },
  brandSection: {
    paddingTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: 0.2,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
});
