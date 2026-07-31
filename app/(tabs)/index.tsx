import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import SneakerCard from "@/components/SneakerCard";
import PremiumSelectorSection from "@/components/PremiumSelectorSection";
import { mockSneakers, mockBrands } from "@/lib/mockData";
import { useRouter } from "expo-router";
import { fetchProducts } from "@/supabase";
import type { Product } from "@/types";
import { Colors, Typography, Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(
    mockSneakers as Product[],
  );
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
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
      return `${brandNameById.get(selectedBrandId) ?? "Brand"}`;
    }
    return "All Sneakers";
  }, [selectedBrandId, brandNameById]);

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
            {trendingSneakers.map((sneaker) => (
              <View key={sneaker.id} style={styles.trendingItem}>
                <SneakerCard
                  sneaker={sneaker}
                  brandName={
                    sneaker.brand_id
                      ? brandNameById.get(sneaker.brand_id) || ""
                      : ""
                  }
                  onPress={() => handleSneakerPress(sneaker.id)}
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
              {filteredSneakers.map((sneaker) => (
                <View key={sneaker.id} style={styles.gridItem}>
                  <SneakerCard
                    sneaker={sneaker}
                    brandName={
                      sneaker.brand_id
                        ? brandNameById.get(sneaker.brand_id) || ""
                        : ""
                    }
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  trendingTitle: {
    fontSize: 21,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: 0.2,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  trendingContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  trendingItem: {
    width: 156,
  },
  // Section - Product grid
  section: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: 0.2,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 32,
  },
  gridItem: {
    width: "47%",
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
    marginBottom: 16,
  },
});
