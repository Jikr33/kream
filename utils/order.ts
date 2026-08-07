// Order UI helpers - moved from services/orders.ts
// These contain presentation logic and should not be in the service layer

export function formatOrderStatus(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: "Awaiting Payment",
    paid: "Paid",
    processing: "Processing",
    shipping: "Shipping",
    completed: "Completed",
    cancelled: "Cancelled",
    failed: "Failed",
  };
  return statusLabels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#F59E0B", // Amber
    paid: "#10B981", // Green
    processing: "#3B82F6", // Blue
    shipping: "#8B5CF6", // Purple
    completed: "#10B981", // Green
    cancelled: "#6B7280", // Gray
    failed: "#EF4444", // Red
  };
  return colors[status] || "#6B7280";
}
