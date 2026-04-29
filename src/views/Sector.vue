<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { sectorsMeta } from '../data/sectors'
import { getCompaniesBySector } from '../data/companies'
import { fetchSectorPrices } from '../services/stockPrice'
import CompanyRow from '../components/CompanyRow.vue'
import type { PriceData } from '../types'

const route = useRoute()
const sectorId = computed(() => route.params.id as string)
const sector = computed(() => sectorsMeta.find(s => s.id === sectorId.value))
const companies = computed(() => getCompaniesBySector(sectorId.value))

const prices = ref<Record<string, PriceData>>({})
const loadingPrices = ref(false)
const sortBy = ref<'weight' | 'marketCap' | 'name'>('weight')
const filterSubIndustry = ref<string>('')

const subIndustries = computed(() => {
  const set = new Set(companies.value.map(c => c.subIndustry))
  return Array.from(set)
})

const sortedCompanies = computed(() => {
  let list = [...companies.value]
  if (filterSubIndustry.value) {
    list = list.filter(c => c.subIndustry === filterSubIndustry.value)
  }
  switch (sortBy.value) {
    case 'weight':
      list.sort((a, b) => b.weight - a.weight)
      break
    case 'name':
      list.sort((a, b) => a.symbol.localeCompare(b.symbol))
      break
    case 'marketCap':
      const order: Record<string, number> = { Mega: 3, Large: 2, Mid: 1 }
      list.sort((a, b) => (order[b.marketCapCategory] || 0) - (order[a.marketCapCategory] || 0) || b.weight - a.weight)
      break
  }
  return list
})

async function loadPrices() {
  if (!companies.value.length) return
  loadingPrices.value = true
  try {
    const symbols = companies.value.map(c => c.symbol)
    prices.value = await fetchSectorPrices(sectorId.value, symbols)
  } catch { /* optional */ }
  finally { loadingPrices.value = false }
}

watch(sectorId, () => {
  prices.value = {}
  filterSubIndustry.value = ''
  loadPrices()
})

onMounted(loadPrices)
</script>

<template>
  <div v-if="sector">
    <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
      <RouterLink to="/" class="hover:text-[#D4302F] transition-colors">首页</RouterLink>
      <span>/</span>
      <span class="text-slate-700 font-medium">{{ sector.nameCn }}</span>
    </nav>

    <div class="bg-white rounded-xl border border-slate-200 p-8 mb-6">
      <div class="flex items-center gap-4 mb-4">
        <div
          class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
          :style="{ backgroundColor: sector.color + '15' }"
        >
          {{ sector.icon }}
        </div>
        <div>
          <h2 class="text-2xl font-bold text-slate-900">{{ sector.nameCn }}</h2>
          <p class="text-sm text-slate-400">{{ sector.name }} · 指数基金: {{ sector.etf }} · {{ companies.length }} 家公司</p>
        </div>
      </div>
      <p class="text-slate-600 leading-relaxed">{{ sector.description }}</p>
    </div>

    <div class="flex items-center justify-between mb-5">
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="filterSubIndustry === '' ? 'bg-[#D4302F] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="filterSubIndustry = ''"
        >全部</button>
        <button
          v-for="sub in subIndustries"
          :key="sub"
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="filterSubIndustry === sub ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          :style="filterSubIndustry === sub ? { backgroundColor: sector.color } : {}"
          @click="filterSubIndustry = sub"
        >{{ sub }}</button>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="text-slate-400">排序：</span>
        <button
          v-for="opt in ([{ key: 'weight', label: '权重' }, { key: 'marketCap', label: '市值' }, { key: 'name', label: '代码' }] as const)"
          :key="opt.key"
          class="px-2.5 py-1 rounded text-sm transition-colors"
          :class="sortBy === opt.key ? 'bg-[#D4302F] text-white' : 'text-slate-500 hover:bg-slate-100'"
          @click="sortBy = opt.key"
        >{{ opt.label }}</button>
      </div>
    </div>

    <div v-if="loadingPrices" class="mb-4 flex items-center gap-2 text-sm text-slate-400">
      <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      正在加载股价数据...
    </div>

    <div class="space-y-3">
      <CompanyRow
        v-for="company in sortedCompanies"
        :key="company.symbol"
        :company="company"
        :price="prices[company.symbol]"
        :sector-color="sector.color"
      />
    </div>

    <div v-if="sortedCompanies.length === 0" class="text-center py-12 text-slate-400">
      该子行业暂无公司数据
    </div>
  </div>

  <div v-else class="text-center py-20">
    <p class="text-slate-400 text-lg">板块不存在</p>
    <RouterLink to="/" class="text-[#D4302F] hover:underline mt-4 inline-block">返回首页</RouterLink>
  </div>
</template>
