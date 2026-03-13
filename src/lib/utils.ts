export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 6 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

export function formatNumber(value: number) {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(2) + "K";
  return value.toFixed(2);
}

export function formatChartPrice(value: number) {
  if (value === 0) return "0.00";
  if (value < 0.0001) return value.toFixed(8);
  if (value < 0.01) return value.toFixed(6);
  if (value < 1) return value.toFixed(4);
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function calculateTimeAgo(timestampInSeconds: number) {
  const seconds = Math.floor(Date.now() / 1000 - timestampInSeconds);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function truncateAddress(address: string) {
  if (!address) return "";
  // Show 0x + first 4 hex chars, then last 4 chars
  if (address.startsWith("0x") && address.length > 10) {
    const prefix = address.slice(0, 2 + 4); // "0x" + 4 chars
    const suffix = address.slice(-4);
    return `${prefix}...${suffix}`;
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
