import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import SneakerCard from "@/components/SneakerCard";
import PremiumSelectorSection from "@/components/PremiumSelectorSection";
import { mockProducts } from "@/lib/mockData";
import { useRouter } from "expo-router";
import { fetchProducts } from "@/supabase";
import type { Product } from "@/types";
import { getBrandName, getBrandList } from "@/constants/brands";
import { Colors, Typography, Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const brandNameById = useMemo(() => {
    const map = new Map<string, string>();
    getBrandList().forEach((brand) => map.set(brand.id, brand.name));
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
      if (selectedBrandId) {
        if (product.brand_id !== selectedBrandId) return false;
      }
      if (selectedCategoryId) {
        if (product.category !== selectedCategoryId) return false;
      }
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
  }, [
    products,
    selectedBrandId,
    selectedCategoryId,
    searchQuery,
    brandNameById,
  ]);

  const handleSneakerPress = useCallback(
    (id: string) => router.push(`/sneaker/${id}`),
    [router],
  );

  const sectionTitle = useMemo(() => {
    if (selectedBrandId) {
      return getBrandName(selectedBrandId);
    }
    return "All Sneakers";
  }, [selectedBrandId]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol
            name="magnifyingglass"
            size={14}
            color={Colors.light.textTertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
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
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={172}>
        {/* Trending - Hero */}
        <View style={styles.trendingSection}>
          <Text style={styles.trendingTitle}>Trending</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingContent}
            decelerationRate="fast"
            snapToInterval={172}>
            {trendingSneakers.map((product) => (
              <View key={product.id} style={styles.trendingItem}>
                <SneakerCard
                  sneaker={product}
                  onPress={() => handleSneakerPress(product.id)}
                  compact
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Filters - Compact */}
        <View style={styles.filters}>
          <PremiumSelectorSection
            type="brand"
            selectedId={selectedBrandId}
            onSelect={setSelectedBrandId}
            showTitle
          />
          <PremiumSelectorSection
            type="category"
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            showTitle={false}
          />
        </View>

        {/* All Sneakers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>

          {filteredSneakers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredSneakers.map((product) => (
                <View key={product.id} style={styles.gridItem}>
                  <SneakerCard
                    sneaker={product}
                    onPress={() => handleSneakerPress(product.id)}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: Colors.light.background,
  },
  searchBar: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    padding: 0,
    marginLeft: 6,
    fontWeight: "400",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Trending Section
  trendingSection: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  trendingTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: 0.15,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  trendingContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingItem: {
    width: 140,
  },
  // Section - Product grid
  section: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: 0.15,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    width: "47.5%",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    letterSpacing: 0.1,
    fontWeight: "400",
  },
  // Filters - inline, compact
  filters: {
    marginBottom: 12,
  },
});
