import { defineConfig } from 'unocss'
import presetUno from '@unocss/preset-uno'
import presetTypography from '@unocss/preset-typography'

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography()
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      }
    }
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none',
    'btn-primary': 'btn bg-primary-500 text-white hover:bg-primary-600',
    'btn-danger': 'btn bg-red-500 text-white hover:bg-red-600',
    'btn-secondary': 'btn bg-gray-500 text-white hover:bg-gray-600',
    'card': 'border border-gray-200 rounded-lg p-6 shadow-sm bg-white',
    'container': 'max-w-4xl mx-auto px-4 py-8'
  }
})