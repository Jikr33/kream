import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import SneakerCard from "@/components/SneakerCard";
import PremiumSelectorSection from "@/components/PremiumSelectorSection";
import { mockBrands, mockCategories, mockSneakers } from "@/lib/mockData";
import { fetchProducts } from "@/supabase";
import { Product } from "@/types";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [products, setProducts] = useState<Product[]>(
    mockSneakers as Product[],
  );

  useEffect(() => {
    async function loadProducts() {
      try {
        const { allProducts, error } = await fetchProducts();
        if (!error && allProducts && allProducts.length > 0) {
          setProducts(allProducts);
          console.log("Explorer loaded", allProducts);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    }

    loadProducts();
  }, []);

  const brandNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    mockBrands.forEach((b) => map.set(b.id, b.name));
    return map;
  }, []);

  const categoryNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    mockCategories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, []);

  const filteredSneakers = products.filter((sneaker) => {
    const categoryValue = (sneaker.category ?? "")
      .toString()
      .trim()
      .toLowerCase();
    const brandValue = (sneaker.brand_id ?? "").toString().trim();
    const nameValue = (sneaker.name ?? "").toString().trim();
    const modelValue = (sneaker.model ?? "").toString().trim();
    const searchValue = searchQuery.trim().toLowerCase();

    if (selectedBrandId) {
      const selectedBrandName = brandNameById
        .get(selectedBrandId)
        ?.toLowerCase();
      const matchesBrand =
        brandValue === selectedBrandId ||
        brandValue === selectedBrandName ||
        brandValue.toLowerCase() === selectedBrandName;
      if (!matchesBrand) return false;
    }

    if (selectedCategoryId) {
      const selectedCategoryName = categoryNameById
        .get(selectedCategoryId)
        ?.toLowerCase();
      const matchesCategory =
        categoryValue === selectedCategoryId ||
        categoryValue === selectedCategoryName ||
        categoryValue === selectedCategoryId.toLowerCase();
      if (!matchesCategory) return false;
    }

    if (searchValue) {
      const searchable =
        `${nameValue} ${modelValue} ${brandValue}`.toLowerCase();
      if (!searchable.includes(searchValue)) return false;
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.searchBar}>
          <IconSymbol
            name="magnifyingglass"
            size={18}
            color={Colors.light.textTertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sneakers..."
            placeholderTextColor={Colors.light.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <PremiumSelectorSection
          type="brand"
          selectedId={selectedBrandId}
          onSelect={setSelectedBrandId}
        />
        <PremiumSelectorSection
          type="category"
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedBrandId
              ? `${brandNameById.get(selectedBrandId) ?? "Brand"} Sneakers`
              : "All Sneakers"}
          </Text>
          {filteredSneakers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredSneakers.map((sneaker) => (
                <View key={sneaker.id} style={styles.gridItem}>
                  <SneakerCard
                    sneaker={sneaker}
                    brandName={sneaker.brand_id || ""}
                    onPress={() => router.push(`/sneaker/${sneaker.id}`)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: Typography.heading.fontSize,
    fontWeight: Typography.heading.fontWeight,
    color: Colors.light.text,
    lineHeight: Typography.heading.lineHeight,
    letterSpacing: Typography.heading.letterSpacing,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.light.text,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    lineHeight: Typography.sectionTitle.lineHeight,
    letterSpacing: Typography.sectionTitle.letterSpacing,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 80,
  },
  gridItem: {
    width: "48%",
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
    fontWeight: Typography.caption.fontWeight,
  },
});
