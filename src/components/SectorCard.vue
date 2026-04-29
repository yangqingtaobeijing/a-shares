<script setup lang="ts">
import type { SectorMeta } from '../data/sectors'
import { getCompaniesBySector } from '../data/companies'
import { computed } from 'vue'

const props = defineProps<{ sector: SectorMeta }>()
const companyCount = computed(() => getCompaniesBySector(props.sector.id).length)
</script>

<template>
  <RouterLink
    :to="`/sector/${sector.id}`"
    class="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 group"
  >
    <div class="flex items-start justify-between mb-4">
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        :style="{ backgroundColor: sector.color + '15' }"
      >{{ sector.icon }}</div>
      <span
        class="text-xs font-medium px-2 py-1 rounded-full"
        :style="{ color: sector.color, backgroundColor: sector.color + '15' }"
      >{{ companyCount }} 家公司</span>
    </div>
    <h3 class="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#D4302F] transition-colors">{{ sector.nameCn }}</h3>
    <p class="text-xs text-slate-400 mb-3">{{ sector.name }} · {{ sector.etf }}</p>
    <p class="text-sm text-slate-500 leading-relaxed line-clamp-2">{{ sector.description }}</p>
  </RouterLink>
</template>
