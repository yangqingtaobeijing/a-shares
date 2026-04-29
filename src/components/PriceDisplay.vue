<script setup lang="ts">
import type { PriceData } from '../types'

defineProps<{
  price?: PriceData | null
  size?: 'sm' | 'lg'
}>()
</script>

<template>
  <div v-if="price" class="flex items-center gap-2">
    <span :class="size === 'lg' ? 'text-2xl font-bold' : 'text-sm font-semibold'" class="text-slate-900">
      ¥{{ price.price.toFixed(2) }}
    </span>
    <span
      :class="[
        size === 'lg' ? 'text-sm px-2 py-1' : 'text-xs px-1.5 py-0.5',
        'rounded font-medium',
        price.changePercent >= 0
          ? 'text-[#D4302F] bg-[#D4302F]/10'
          : 'text-[#10B981] bg-[#10B981]/10'
      ]"
    >
      {{ price.changePercent >= 0 ? '+' : '' }}{{ price.changePercent.toFixed(2) }}%
    </span>
  </div>
  <div v-else>
    <span :class="size === 'lg' ? 'text-xl' : 'text-sm'" class="text-slate-300">--</span>
  </div>
</template>
