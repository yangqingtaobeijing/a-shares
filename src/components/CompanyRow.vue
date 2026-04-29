<script setup lang="ts">
import type { Company, PriceData } from '../types'
import MoatBadge from './MoatBadge.vue'
import PriceDisplay from './PriceDisplay.vue'

defineProps<{
  company: Company
  price?: PriceData | null
  sectorColor: string
}>()
</script>

<template>
  <RouterLink
    :to="`/company/${company.symbol}`"
    class="block bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
  >
    <div class="flex items-start gap-4">
      <div
        class="w-11 h-11 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        :style="{ backgroundColor: sectorColor }"
      >{{ company.symbol.slice(0, 2) }}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h4 class="font-semibold text-slate-900 group-hover:text-[#D4302F] transition-colors">{{ company.nameCn }}</h4>
          <span class="text-xs text-slate-400">{{ company.name }}</span>
        </div>
        <div class="flex items-center gap-3 mb-2">
          <span class="text-xs font-mono font-medium text-[#D4302F]">{{ company.symbol }}</span>
          <span class="text-xs text-slate-400">权重 {{ company.weight }}%</span>
          <span
            class="text-xs px-1.5 py-0.5 rounded"
            :class="{
              'bg-purple-50 text-purple-600': company.marketCapCategory === 'Mega',
              'bg-blue-50 text-blue-600': company.marketCapCategory === 'Large',
              'bg-green-50 text-green-600': company.marketCapCategory === 'Mid',
            }"
          >{{ company.marketCapCategory }}</span>
        </div>
        <div class="flex flex-wrap gap-1.5 mb-2">
          <MoatBadge v-for="moat in company.moats" :key="moat" :moat="moat" />
        </div>
        <p class="text-sm text-slate-500 line-clamp-1">{{ company.description }}</p>
      </div>
      <div class="flex-shrink-0 text-right">
        <PriceDisplay :price="price" size="sm" />
      </div>
    </div>
  </RouterLink>
</template>
