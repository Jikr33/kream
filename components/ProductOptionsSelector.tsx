import React, { memo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BorderRadius } from "@/constants/theme";

type SizeOption = {
  size: string;
  available: boolean;
};

type ColorOption = {
  name: string;
  hex: string;
};

type ProductOptionsSelectorProps = {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  maxQuantity: number;
  sizes: SizeOption[];
  colors: ColorOption[];
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  onQuantityChange: (qty: number) => void;
};

const ProductOptionsSelector = memo(function ProductOptionsSelector({
  selectedSize,
  selectedColor,
  quantity,
  maxQuantity,
  sizes,
  colors,
  onSizeChange,
  onColorChange,
  onQuantityChange,
}: ProductOptionsSelectorProps) {
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);

  const handleQuantityDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleQuantityIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Size Selector */}
      <TouchableOpacity
        style={styles.optionRow}
        onPress={() => setSizeModalVisible(true)}
        activeOpacity={0.7}>
        <View style={styles.optionInfo}>
          <Text style={styles.optionLabel}>Size</Text>
          <Text style={styles.optionValue}>US {selectedSize}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Color Selector */}
      <TouchableOpacity
        style={styles.optionRow}
        onPress={() => setColorModalVisible(true)}
        activeOpacity={0.7}>
        <View style={styles.optionInfo}>
          <Text style={styles.optionLabel}>Color</Text>
          <View style={styles.colorValue}>
            <View
              style={[styles.colorSwatch, { backgroundColor: getColorHex(selectedColor) }]}
            />
            <Text style={styles.optionValue}>{selectedColor}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Quantity Selector */}
      <View style={styles.optionRow}>
        <View style={styles.optionInfo}>
          <Text style={styles.optionLabel}>Quantity</Text>
        </View>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={handleQuantityDecrement}
            disabled={quantity <= 1}
            activeOpacity={0.7}>
            <MaterialIcons
              name="remove"
              size={18}
              color={quantity <= 1 ? "#D1D5DB" : "#111111"}
            />
          </TouchableOpacity>
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>
          <TouchableOpacity
            style={[styles.quantityButton, quantity >= maxQuantity && styles.quantityButtonDisabled]}
            onPress={handleQuantityIncrement}
            disabled={quantity >= maxQuantity}
            activeOpacity={0.7}>
            <MaterialIcons
              name="add"
              size={18}
              color={quantity >= maxQuantity ? "#D1D5DB" : "#111111"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Size Selection Modal */}
      <Modal
        visible={sizeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSizeModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Size</Text>
            <TouchableOpacity
              onPress={() => setSizeModalVisible(false)}
              style={styles.modalClose}>
              <MaterialIcons name="close" size={24} color="#111111" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.sizeGrid}>
              {sizes.map((item) => (
                <TouchableOpacity
                  key={item.size}
                  style={[
                    styles.sizeChip,
                    item.size === selectedSize && styles.sizeChipSelected,
                    !item.available && styles.sizeChipDisabled,
                  ]}
                  onPress={() => {
                    if (item.available) {
                      onSizeChange(item.size);
                      setSizeModalVisible(false);
                    }
                  }}
                  disabled={!item.available}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.sizeChipText,
                      item.size === selectedSize && styles.sizeChipTextSelected,
                      !item.available && styles.sizeChipTextDisabled,
                    ]}>
                    US {item.size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Color Selection Modal */}
      <Modal
        visible={colorModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setColorModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Color</Text>
            <TouchableOpacity
              onPress={() => setColorModalVisible(false)}
              style={styles.modalClose}>
              <MaterialIcons name="close" size={24} color="#111111" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.colorOption,
                  color.name === selectedColor && styles.colorOptionSelected,
                ]}
                onPress={() => {
                  onColorChange(color.name);
                  setColorModalVisible(false);
                }}
                activeOpacity={0.7}>
                <View
                  style={[styles.colorSwatchLarge, { backgroundColor: color.hex }]}
                />
                <Text style={styles.colorOptionText}>{color.name}</Text>
                {color.name === selectedColor && (
                  <MaterialIcons name="check" size={20} color="#111111" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
});

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    White: "#FFFFFF",
    Black: "#000000",
    Red: "#DC2626",
    Blue: "#2563EB",
    Green: "#16A34A",
    Yellow: "#EAB308",
    Pink: "#EC4899",
    Grey: "#6B7280",
    Brown: "#92400E",
    Navy: "#1E3A5F",
  };
  return colorMap[colorName] || "#9CA3AF";
}

export default ProductOptionsSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    letterSpacing: 0.1,
    width: 70,
  },
  optionValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
    letterSpacing: 0.1,
  },
  colorValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F4",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#F9FAFB",
  },
  quantityDisplay: {
    width: 32,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111111",
    letterSpacing: 0.1,
  },
  modalClose: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeChip: {
    minWidth: 64,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#ECECEC",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeChipSelected: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  sizeChipDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#F3F4F6",
  },
  sizeChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
    letterSpacing: 0.1,
  },
  sizeChipTextSelected: {
    color: "#FFFFFF",
  },
  sizeChipTextDisabled: {
    color: "#D1D5DB",
  },
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    marginBottom: 10,
    gap: 14,
  },
  colorOptionSelected: {
    borderWidth: 1,
    borderColor: "#111111",
  },
  colorSwatchLarge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  colorOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    letterSpacing: 0.1,
  },
});
