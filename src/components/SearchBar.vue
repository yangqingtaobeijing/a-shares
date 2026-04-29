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
    .slice(0, 5)
})

// Detect if query looks like a stock code
const codeMatch = computed(() => {
  const q = query.value.trim()
  const m = q.match(/^(\d{6})$/)
  return m ? m[1] : null
})

const externalSites = computed(() => {
  const q = query.value.trim()
  const code = codeMatch.value
  if (code) {
    const isSH = code.startsWith('6') || code.startsWith('5') || code.startsWith('9')
    return [
      { icon: '📊', name: '东方财富', url: `https://quote.eastmoney.com/${isSH ? 'sh' : 'sz'}${code}.html` },
      { icon: '📈', name: '同花顺', url: `https://stockpage.10jqka.com.cn/${code}/` },
      { icon: '💬', name: '雪球', url: `https://xueqiu.com/S/${isSH ? 'SH' : 'SZ'}${code}` },
    ]
  }
  return [
    { icon: '📊', name: '东方财富', url: `https://so.eastmoney.com/news/s?keyword=${encodeURIComponent(q)}` },
    { icon: '📈', name: '同花顺', url: `https://www.10jqka.com.cn/search/index?key=${encodeURIComponent(q)}` },
    { icon: '💬', name: '雪球', url: `https://xueqiu.com/k?q=${encodeURIComponent(q)}` },
  ]
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

const totalItems = computed(() => results.value.length + (results.value.length < 5 ? externalSites.value.length : 0))

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, totalItems.value - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    const idx = selectedIndex.value
    if (idx < results.value.length) {
      goToCompany(results.value[idx].symbol)
    } else {
      const ext = externalSites.value[idx - results.value.length]
      if (ext) window.open(ext.url, '_blank')
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

function isSelected(index: number) {
  return index === selectedIndex.value
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
        placeholder="搜索公司名称或代码，搜不到直接跳外部..."
        class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4302F]/20 focus:border-[#D4302F] transition-all"
        @keydown="handleKeydown"
        @focus="isOpen = query.trim().length > 0"
        @blur="handleBlur"
      />
    </div>

    <div
      v-if="isOpen && totalItems > 0"
      class="absolute top-full mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50"
    >
      <!-- Internal results -->
      <div
        v-for="(company, i) in results"
        :key="company.symbol"
        class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
        :class="isSelected(i) ? 'bg-red-50' : 'hover:bg-slate-50'"
        @mousedown.prevent="goToCompany(company.symbol)"
        @mouseenter="selectedIndex = i"
      >
        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" :style="{ backgroundColor: '#D4302F' }">
          {{ company.symbol.slice(0, 2) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm text-slate-900 truncate">{{ company.nameCn }}</div>
          <div class="text-xs text-slate-400">{{ company.symbol }} · {{ company.name }}</div>
        </div>
      </div>

      <!-- Divider if both sections exist -->
      <div v-if="results.length > 0" class="border-t border-slate-100">
        <div class="px-4 py-1.5 text-xs text-slate-400 bg-slate-50">搜不到？跳转外部平台</div>
      </div>

      <!-- External site links -->
      <a
        v-for="(site, i) in externalSites"
        :key="site.name"
        :href="site.url"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors"
        :class="isSelected(results.length + i) ? 'bg-red-50 text-[#D4302F]' : 'text-slate-600 hover:bg-slate-50'"
        @mouseenter="selectedIndex = results.length + i"
      >
        <span class="text-base w-6 text-center">{{ site.icon }}</span>
        <span class="text-sm">{{ site.name }}</span>
        <svg class="w-3 h-3 text-slate-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
      </a>
    </div>
  </div>
</template>
