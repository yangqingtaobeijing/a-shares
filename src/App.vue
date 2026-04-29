<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import SearchBar from './components/SearchBar.vue'
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div class="w-9 h-9 bg-[#D4302F] rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-900 leading-tight">A股板块分析</h1>
            <p class="text-xs text-slate-400 leading-tight">A-Share Sector Analysis</p>
          </div>
        </RouterLink>
        <div class="w-96">
          <SearchBar />
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <RouterView />
    </main>

    <footer class="border-t border-slate-200 bg-white mt-12">
      <div class="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
        <p>数据仅供参考，不构成投资建议。股价数据来自 Twelve Data（延迟）。</p>
        <p class="mt-1">© 2025 A股板块分析 · 基于申万一级行业分类标准</p>
      </div>
    </footer>
  </div>
</template>
