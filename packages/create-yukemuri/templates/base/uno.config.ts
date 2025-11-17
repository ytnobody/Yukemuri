import { defineConfig } from "unocss"
import presetUno from "@unocss/preset-uno"
import presetTypography from "@unocss/preset-typography"

export default defineConfig({
  content: {
    pipeline: {
      include: [
        // デフォルトのファイルパターン
        /\.(vue|svelte|[jt]sx?|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // Yukemuri特有のパターン
        "app/**/*.{js,ts,jsx,tsx}",
        "src/**/*.{js,ts,jsx,tsx}",
      ],
    },
  },
  presets: [presetUno(), presetTypography()],
  theme: {
    fontSize: {
      "8xl": "6rem",
      "9xl": "8rem",
    },
    colors: {
      primary: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
      },
    },
  },
  shortcuts: {
    btn: "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none",
    "btn-primary": "btn bg-primary-500 text-white hover:bg-primary-600",
    "btn-danger": "btn bg-red-500 text-white hover:bg-red-600",
    "btn-secondary": "btn bg-gray-500 text-white hover:bg-gray-600",
    card: "border border-gray-200 rounded-lg p-6 shadow-sm bg-white",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  },
  rules: [
    // カスタムtext-8xlルール（6rem = 96px）
    ["text-8xl", { "font-size": "6rem", "line-height": "1" }],
  ],
  safelist: [
    // 重要なスタイルを強制的に生成
    "text-8xl",
    "text-4xl",
    "text-2xl",
    "text-xl",
    "text-lg",
    "font-bold",
    "font-semibold",
    "font-medium",
    "text-center",
    "text-gray-900",
    "text-gray-600",
    "text-primary-600",
    "mb-4",
    "mb-6",
    "mb-8",
    "container",
    "card",
    "btn-primary",
    "btn-danger",
    "btn-secondary",
    "bg-gray-50",
    "min-h-screen",
    "flex",
    "gap-3",
    "space-y-2",
    "space-y-4",
  ],
})
