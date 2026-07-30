import React, { useState, useEffect, useMemo, useCallback } from "react";
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

const SEARCH_BAR_HEIGHT = 46;

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(mockSneakers as Product[]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { allProducts, error } = await fetchProducts();
        if (!error && allProducts && allProducts.length > 0) {
          setProducts(allProducts);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    }
    loadProducts();
  }, []);

  const brandNameById = useMemo(() => {
    const map = new Map<string, string>();
    mockBrands.forEach((b) => map.set(b.id, b.name));
    return map;
  }, []);

  const filteredSneakers = useMemo(() => {
    return products.filter((sneaker) => {
      // Brand filter
      if (selectedBrandId) {
        if (sneaker.brand_id !== selectedBrandId) return false;
      }
      // Category filter
      if (selectedCategoryId) {
        if (sneaker.category !== selectedCategoryId) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          sneaker.name,
          brandNameById.get(sneaker.brand_id) || "",
          sneaker.category,
          sneaker.model || "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [products, selectedBrandId, selectedCategoryId, searchQuery, brandNameById]);

  const handleSneakerPress = useCallback(
    (id: string) => router.push(`/sneaker/${id}`),
    [router]
  );

  const sectionTitle = useMemo(() => {
    if (selectedBrandId) {
      return `${brandNameById.get(selectedBrandId) ?? "Brand"}`;
    }
    return "All Sneakers";
  }, [selectedBrandId, brandNameById]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
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
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Brands */}
        <PremiumSelectorSection
          type="brand"
          selectedId={selectedBrandId}
          onSelect={setSelectedBrandId}
          showTitle={false}
        />

        {/* Categories */}
        <PremiumSelectorSection
          type="category"
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          showTitle={false}
        />

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>

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
                    brandName={brandNameById.get(sneaker.brand_id) || ""}
                    onPress={() => handleSneakerPress(sneaker.id)}
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    color: Colors.light.text,
    letterSpacing: 0.3,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    height: SEARCH_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.search.fontSize,
    color: Colors.light.text,
    padding: 0,
    marginLeft: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.section,
  },
  sectionTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    letterSpacing: Typography.sectionTitle.letterSpacing,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  gridItem: {
    width: "47%",
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.light.textSecondary,
  },
});
