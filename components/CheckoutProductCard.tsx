import React, { memo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BorderRadius, Shadows } from "@/constants/theme";
import * as Haptics from "expo-haptics";

type ColorOption = {
  name: string;
  value: string;
};

type CheckoutProductCardProps = {
  brandName: string;
  productName: string;
  color?: string;
  size?: string;
  quantity?: number;
  price: number;
  imageUrl?: string | null;
  availableSizes?: string[];
  availableColors?: ColorOption[];
  maxStock?: number;
  onSizeSelect?: (size: string) => void;
  onColorSelect?: (color: ColorOption) => void;
  onQuantityChange?: (delta: number) => void;
};

const CheckoutProductCard = memo(function CheckoutProductCard({
  brandName,
  productName,
  color = "White",
  size = "10",
  quantity = 1,
  price,
  imageUrl,
  availableSizes = [],
  availableColors = [],
  maxStock = 10,
  onSizeSelect,
  onColorSelect,
  onQuantityChange,
}: CheckoutProductCardProps) {
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);

  const handleSizePress = () => {
    if (onSizeSelect && availableSizes.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowSizeSelector(true);
    }
  };

  const handleColorPress = () => {
    if (onColorSelect && availableColors.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowColorSelector(true);
    }
  };

  const handleQuantityDelta = (delta: number) => {
    if (onQuantityChange) {
      onQuantityChange(delta);
    }
  };

  return (
    <View style={styles.card}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={150}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialIcons name="checkroom" size={32} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.brand}>{brandName}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {productName}
        </Text>

        {/* Size Selector - Compact */}
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={handleSizePress}
          activeOpacity={0.7}
          disabled={availableSizes.length === 0}>
          <View style={styles.selectorLeft}>
            <Text style={styles.selectorLabel}>Size</Text>
            <Text style={styles.selectorText}>{size}</Text>
          </View>
          {availableSizes.length > 0 && (
            <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
          )}
        </TouchableOpacity>

        {/* Color Selector - Compact */}
        {availableColors.length > 0 && (
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={handleColorPress}
            activeOpacity={0.7}>
            <View style={styles.selectorLeft}>
              <Text style={styles.selectorLabel}>Color</Text>
              <View style={styles.selectorValueRow}>
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor:
                        availableColors.find((c) => c.name === color)?.value ||
                        "#FFFFFF",
                    },
                  ]}
                />
                <Text style={styles.selectorText}>{color}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}

        {/* Quantity Selector - Elegant */}
        <View style={styles.quantityRow}>
          <Text style={styles.selectorLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={() => handleQuantityDelta(-1)}
              disabled={quantity <= 1}
              activeOpacity={0.7}>
              <MaterialIcons
                name="remove"
                size={18}
                color={quantity <= 1 ? "#D1D5DB" : "#111111"}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= maxStock && styles.quantityButtonDisabled,
              ]}
              onPress={() => handleQuantityDelta(1)}
              disabled={quantity >= maxStock}
              activeOpacity={0.7}>
              <MaterialIcons
                name="add"
                size={18}
                color={quantity >= maxStock ? "#D1D5DB" : "#111111"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          ₮{(price * quantity).toLocaleString("mn-MN")}
        </Text>
      </View>

      {/* Size Selection Modal */}
      {showSizeSelector && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSizeSelector(false)}
          />
          <View style={styles.sizeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Size</Text>
              <TouchableOpacity onPress={() => setShowSizeSelector(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sizeList}>
              {availableSizes.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.sizeChip,
                    size === s && styles.sizeChipSelected,
                  ]}
                  onPress={() => {
                    onSizeSelect?.(s);
                    setShowSizeSelector(false);
                  }}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.sizeChipText,
                      size === s && styles.sizeChipTextSelected,
                    ]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Color Selection Modal */}
      {showColorSelector && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowColorSelector(false)}
          />
          <View style={styles.colorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Color</Text>
              <TouchableOpacity onPress={() => setShowColorSelector(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.colorList}>
              {availableColors.map((c) => (
                <TouchableOpacity
                  key={c.name}
                  style={[
                    styles.colorOption,
                    color === c.name && styles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    onColorSelect?.(c);
                    setShowColorSelector(false);
                  }}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.colorPreviewLarge,
                      { backgroundColor: c.value },
                    ]}
                  />
                  <Text
                    style={[
                      styles.colorOptionText,
                      color === c.name && styles.colorOptionTextSelected,
                    ]}>
                    {c.name}
                  </Text>
                  {color === c.name && (
                    <MaterialIcons name="check" size={20} color="#111111" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
});

export default CheckoutProductCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.card,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: "#FAFAF8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  brand: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    lineHeight: 20,
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  selectorLeft: {
    flex: 1,
    gap: 2,
  },
  selectorValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#F5F5F4",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    minWidth: 24,
    textAlign: "center",
  },
  priceContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 12,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.2,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sizeModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  colorModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.3,
  },
  sizeList: {
    padding: 20,
    maxHeight: 300,
  },
  sizeChip: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F5F5F4",
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  sizeChipSelected: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  sizeChipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  sizeChipTextSelected: {
    color: "#FFFFFF",
  },
  colorList: {
    padding: 20,
  },
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F5F5F4",
    marginBottom: 10,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  colorOptionSelected: {
    backgroundColor: "#FAFAF8",
    borderColor: "#111111",
  },
  colorPreviewLarge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  colorOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    letterSpacing: 0.1,
  },
  colorOptionTextSelected: {
    fontWeight: "600",
  },
});
