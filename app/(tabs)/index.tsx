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
import { Colors, Typography, Spacing } from "@/constants/theme";

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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol
            name="magnifyingglass"
            size={18}
            color="#9CA3AF"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sneakers..."
            placeholderTextColor="#9CA3AF"
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
        snapToInterval={160}>
        {/* Trending - Hero Section */}
        <View style={styles.trendingSection}>
          <Text style={styles.trendingTitle}>Trending</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingContent}
            decelerationRate="fast"
            snapToInterval={160}>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: Colors.light.background,
  },
  searchBar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111111",
    padding: 0,
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Trending Section - Hero
  trendingSection: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  trendingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.2,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  trendingContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingItem: {
    width: 155,
  },
  // Section
  section: {
    paddingTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.2,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
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
    color: "#6B7280",
  },
});
