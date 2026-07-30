import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import SneakerCard from "@/components/SneakerCard";
import PremiumSelectorSection from "@/components/PremiumSelectorSection";
import { mockSneakers, mockBrands } from "@/lib/mockData";
import { useRouter } from "expo-router";
import { fetchProducts } from "@/supabase";
import type { Product } from "@/types";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/theme";

const SEARCH_BAR_HEIGHT = 46;

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(mockSneakers as Product[]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const router = useRouter();

  const brandNameById = useMemo(() => {
    const map = new Map<string, string>();
    mockBrands.forEach((brand) => map.set(brand.id, brand.name));
    return map;
  }, []);

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

  const trendingSneakers = useMemo(() => products.slice(0, 6), [products]);

  const filteredSneakers = useMemo(() => {
    return products.filter((product) => {
      // Brand filter
      if (selectedBrandId) {
        if (product.brand_id !== selectedBrandId) return false;
      }
      // Category filter
      if (selectedCategoryId) {
        if (product.category !== selectedCategoryId) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          product.name,
          product.brand_id ? brandNameById.get(product.brand_id) : "",
          product.category,
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
      {/* Search Bar - Compact, 46px height */}
      <View style={styles.searchContainer}>
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
        {/* Trending Today - Visual Hero */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingContent}>
            {trendingSneakers.map((sneaker) => (
              <View key={sneaker.id} style={styles.trendingItem}>
                <SneakerCard
                  sneaker={sneaker}
                  brandName={brandNameById.get(sneaker.brand_id) || ""}
                  onPress={() => handleSneakerPress(sneaker.id)}
                  compact
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Brands */}
        <PremiumSelectorSection
          type="brand"
          selectedId={selectedBrandId}
          onSelect={setSelectedBrandId}
          showTitle
        />

        {/* Categories */}
        <PremiumSelectorSection
          type="category"
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          showTitle={false}
        />

        {/* All Sneakers */}
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
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.background,
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
  trendingContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  trendingItem: {
    width: 140,
    marginRight: Spacing.sm,
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
