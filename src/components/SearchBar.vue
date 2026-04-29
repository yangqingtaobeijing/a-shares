<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { allCompanies } from '../data/companies'

const router = useRouter()
const query = ref('')
const isOpen = ref(false)
const selectedIndex = ref(0)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return allCompanies
    .filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nameCn.includes(q) ||
      c.symbol.toLowerCase().includes(q)
    )
    .slice(0, 8)
})

watch(query, () => {
  isOpen.value = query.value.trim().length > 0
  selectedIndex.value = 0
})

function goToCompany(symbol: string) {
  query.value = ''
  isOpen.value = false
  router.push(`/company/${symbol}`)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter' && results.value[selectedIndex.value]) {
    goToCompany(results.value[selectedIndex.value].symbol)
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

function handleBlur() {
  setTimeout(() => { isOpen.value = false }, 200)
}
</script>

<template>
  <div class="relative">
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="query"
        type="text"
        placeholder="搜索公司名称或代码..."
        class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4302F]/20 focus:border-[#D4302F] transition-all"
        @keydown="handleKeydown"
        @focus="isOpen = query.trim().length > 0"
        @blur="handleBlur"
      />
    </div>

    <div
      v-if="isOpen && results.length > 0"
      class="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50"
    >
      <div
        v-for="(company, i) in results"
        :key="company.symbol"
        class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
        :class="i === selectedIndex ? 'bg-red-50' : 'hover:bg-slate-50'"
        @mousedown.prevent="goToCompany(company.symbol)"
        @mouseenter="selectedIndex = i"
      >
        <div
          class="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          :style="{ backgroundColor: '#D4302F' }"
        >{{ company.symbol.slice(0, 2) }}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm text-slate-900">{{ company.nameCn }}</span>
            <span class="text-xs text-slate-400">{{ company.name }}</span>
          </div>
          <span class="text-xs text-slate-400">{{ company.symbol }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="isOpen && query.trim().length > 0 && results.length === 0"
      class="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50"
    >
      <p class="text-sm text-slate-400 text-center">未找到匹配的公司</p>
    </div>
  </div>
</template>
