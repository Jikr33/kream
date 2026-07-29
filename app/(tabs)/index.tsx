import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>(
    mockSneakers as Product[],
  );
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const router = useRouter();
  const searchInputRef = useRef<TextInput | null>(null);

  const brandNameById = React.useMemo(() => {
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

  const trendingSneakers = products.slice(0, 5);
  const popularBrands = mockBrands;

  const filteredSneakers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (selectedBrandId) {
        const brandValue = (product.brand_id ?? "")
          .toString()
          .trim()
          .toLowerCase();
        const selectedBrandName = brandNameById
          .get(selectedBrandId)
          ?.toLowerCase();
        const matchesId = brandValue === selectedBrandId;
        const matchesName = selectedBrandName
          ? brandValue === selectedBrandName
          : false;
        if (!matchesId && !matchesName) return false;
      }

      if (q) {
        const text = [
          product.name,
          product.description,
          product.category,
          product.location,
          product.sex,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [products, selectedBrandId, searchQuery, brandNameById]);

  const sectionTitle = selectedBrandId
    ? `${brandNameById.get(selectedBrandId) ?? "Brand"} Sneakers`
    : "All Sneakers";

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol
            name="magnifyingglass"
            size={18}
            color={Colors.light.textTertiary}
          />
          <TextInput
            ref={searchInputRef}
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
        {/* Trending Today */}
        <View style={styles.section}>
          <View style={styles.trendingHeader}>
            <Text style={styles.trendingTitle}>Trending Today</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingContent}>
            {trendingSneakers.map((sneaker) => (
              <View key={sneaker.id} style={styles.trendingItem}>
                <SneakerCard
                  sneaker={sneaker}
                  brandName={sneaker.brand_id || ""}
                  onPress={() => router.push(`/sneaker/${sneaker.id}`)}
                  compact
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Popular Brands */}
        <View style={styles.brandsSection}>
          <PremiumSelectorSection
            type="brand"
            selectedId={selectedBrandId}
            onSelect={setSelectedBrandId}
          />
        </View>

        {/* All Sneakers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          </View>

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
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.light.background,
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
  trendingHeader: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  trendingTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    lineHeight: Typography.sectionTitle.lineHeight,
    letterSpacing: Typography.sectionTitle.letterSpacing,
  },
  trendingContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  trendingItem: {
    width: 150,
    marginRight: Spacing.sm,
  },
  brandsSection: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sectionTitle.fontSize,
    fontWeight: Typography.sectionTitle.fontWeight,
    color: Colors.light.text,
    lineHeight: Typography.sectionTitle.lineHeight,
    letterSpacing: Typography.sectionTitle.letterSpacing,
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
