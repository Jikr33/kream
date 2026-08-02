import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import SneakerCard from "@/components/SneakerCard";
import PremiumSelectorSection from "@/components/PremiumSelectorSection";
import LoadingOverlay from "@/components/LoadingOverlay";
import { mockProducts } from "@/lib/mockData";
import { fetchProducts } from "@/services/products";
import type { ProductWithDetails, Product } from "@/types";
import { getBrandName, getBrandList } from "@/constants/brands";
import { Colors, Typography, Spacing } from "@/constants/theme";

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);

  const contentOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const startedAt = Date.now();
    const MIN_LOADING_MS = 200;

    async function loadProducts() {
      try {
        const products = await fetchProducts();
        if (products && products.length > 0 && mounted) {
          setProducts(products);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        if (mounted) {
          const elapsed = Date.now() - startedAt;
          const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
              Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 220,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }).start();
            }
          }, remaining);
        }
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const brandNameById = useMemo(() => {
    const map = new Map<string, string>();
    getBrandList().forEach((b) => map.set(b.id, b.name));
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
          sneaker.category || "",
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
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}>
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
                    onPress={() => handleSneakerPress(sneaker.id)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Global loading overlay */}
      <LoadingOverlay
        visible={isLoading}
        fullscreen
        size={50}
        color="#111111"
        minDurationMs={200}
      />
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
    paddingBottom: Spacing.sm,
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
