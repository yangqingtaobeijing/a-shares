<script setup lang="ts">
import { sectorsMeta } from '../data/sectors'
import { allCompanies } from '../data/companies'
import SectorCard from '../components/SectorCard.vue'
</script>

<template>
  <div>
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold text-slate-900 mb-3">A 股 12 大板块全景</h2>
      <p class="text-slate-500 text-lg">
        按申万一级行业分类，覆盖
        <span class="font-semibold text-[#D4302F]">{{ allCompanies.length }}+</span>
        家核心上市公司的板块分析与竞争壁垒解读
      </p>
    </div>

    <div class="grid grid-cols-3 gap-5">
      <SectorCard
        v-for="sector in sectorsMeta"
        :key="sector.id"
        :sector="sector"
      />
    </div>

    <div class="mt-12 grid grid-cols-4 gap-6">
      <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
        <div class="text-3xl font-bold text-[#D4302F] mb-1">{{ sectorsMeta.length }}</div>
        <div class="text-sm text-slate-500">申万一级板块</div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
        <div class="text-3xl font-bold text-[#10B981] mb-1">{{ allCompanies.length }}</div>
        <div class="text-sm text-slate-500">代表性公司</div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
        <div class="text-3xl font-bold text-[#F59E0B] mb-1">24</div>
        <div class="text-sm text-slate-500">护城河类型</div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 text-center">
        <div class="text-3xl font-bold text-[#6366F1] mb-1">100%</div>
        <div class="text-sm text-slate-500">中文解读</div>
      </div>
    </div>
  </div>
</template>
