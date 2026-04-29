<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCompanyBySymbol, getCompaniesBySector } from '../data/companies'
import { sectorsMeta } from '../data/sectors'
import { fetchSectorPrices } from '../services/stockPrice'
import MoatBadge from '../components/MoatBadge.vue'
import PriceDisplay from '../components/PriceDisplay.vue'
import type { PriceData } from '../types'

const route = useRoute()
const symbol = computed(() => route.params.symbol as string)
const company = computed(() => getCompanyBySymbol(symbol.value))
const sector = computed(() => sectorsMeta.find(s => s.id === company.value?.sectorId))
const sectorCompanies = computed(() => company.value ? getCompaniesBySector(company.value.sectorId) : [])

const prices = ref<Record<string, PriceData>>({})

onMounted(async () => {
  if (company.value && sectorCompanies.value.length) {
    try {
      prices.value = await fetchSectorPrices(company.value.sectorId, sectorCompanies.value.map(c => c.symbol))
    } catch { /* optional */ }
  }
})

// External data site links for A-shares
function getEastMoneyUrl(symbol: string): string {
  const isSH = symbol.startsWith('6') || symbol.startsWith('5') || symbol.startsWith('9')
  return `https://quote.eastmoney.com/${isSH ? 'sh' : 'sz'}${symbol}.html`
}
function getXueqiuUrl(symbol: string): string {
  const exchange = (symbol.startsWith('6') || symbol.startsWith('5') || symbol.startsWith('9')) ? 'SH' : 'SZ'
  return `https://xueqiu.com/S/${exchange}${symbol}`
}
function getTonghuashunUrl(symbol: string): string {
  return `https://stockpage.10jqka.com.cn/${symbol}/`
}

const financialFields = [
  { key: 'marketCap', label: '市值', unit: '元', desc: '公司所有股票的总市场价值，等于股价×总股本。反映市场对公司的整体估值。', ref: 'Mega >5000亿，Large 500-5000亿，Mid <500亿' },
  { key: 'revenue', label: '年营收', unit: '元', desc: '公司一年内的主营业务收入总额。反映公司的经营规模和市场份额，但不等于利润。', ref: '持续增长且增速>行业平均水平为佳' },
  { key: 'netIncome', label: '净利润', unit: '元', desc: '扣除所有成本、费用和税后的最终利润。是公司"真正赚到的钱"，也是分红的来源。', ref: '连续多年正增长为佳，忽盈忽亏需警惕' },
  { key: 'pe', label: 'PE 市盈率', unit: '倍', desc: '股价÷每股收益。衡量市场愿意为公司每1元利润支付多少价格。市盈率越低，回本越快，但也可能反映市场对公司前景悲观。', ref: '成长股 20-40，价值股 8-15，过高可能泡沫，过低可能价值陷阱' },
  { key: 'grossMargin', label: '毛利率', unit: '%', desc: '（营收-营业成本）÷营收。反映产品/服务的定价能力和成本控制能力。毛利率越高，护城河越宽。', ref: '>40% 优秀，20-40% 正常，<20% 红海竞争' },
  { key: 'netMargin', label: '净利率', unit: '%', desc: '净利润÷营收。衡量每1元营收最终能留下多少利润。毛利率看产品力，净利率看管理效率。', ref: '>20% 优秀，10-20% 良好，<5% 利润微薄' },
  { key: 'roe', label: 'ROE', unit: '%', desc: '净利润÷股东权益。衡量公司用股东的钱赚钱的效率。巴菲特最看重的指标之一（偏爱长期ROE>15%的公司）。', ref: '>20% 优秀，15-20% 良好，<10% 资本效率偏低' },
  { key: 'freeCashFlow', label: '自由现金流', unit: '元', desc: '经营性现金流减去资本支出后剩的钱。是公司可以自由支配的"真金白银"，比净利润更难造假。', ref: '持续为正且增长为佳，长期为负说明大量烧钱投资' },
  { key: 'eps', label: '每股收益 EPS', unit: '元', desc: '净利润÷总股本。直接反映每股股票的盈利能力，是计算市盈率的基础。', ref: '连续多年增长为佳，与股价涨幅对比看估值变化' },
  { key: 'dividendYield', label: '股息率', unit: '%', desc: '每股分红÷股价。反映持有股票一年能获得的现金回报率。高股息率适合追求稳定现金流的投资者。', ref: '>3% 较高，1-3% 正常；过高需警惕是否为"价值陷阱"' },
] as const

function formatFinancialValue(key: string, value: string | number): string {
  if (typeof value === 'string') return value
  if (key === 'pe') return value > 0 ? value.toFixed(1) : 'N/A'
  if (['grossMargin', 'netMargin', 'roe', 'dividendYield'].includes(key)) return value.toFixed(1) + '%'
  if (key === 'eps') return '¥' + value.toFixed(2)
  return String(value)
}

interface ComparisonMetric {
  key: string
  label: string
  getValue: (c: typeof sectorCompanies.value[number]) => number
  format: (v: number) => string
  higherIsBetter: boolean
}

const comparisonMetrics: ComparisonMetric[] = [
  { key: 'pe', label: 'PE 市盈率', getValue: (c) => c.financials.pe, format: (v) => v > 0 ? v.toFixed(1) : 'N/A', higherIsBetter: false },
  { key: 'grossMargin', label: '毛利率', getValue: (c) => c.financials.grossMargin, format: (v) => v.toFixed(1) + '%', higherIsBetter: true },
  { key: 'netMargin', label: '净利率', getValue: (c) => c.financials.netMargin, format: (v) => v.toFixed(1) + '%', higherIsBetter: true },
  { key: 'roe', label: 'ROE', getValue: (c) => c.financials.roe, format: (v) => v.toFixed(1) + '%', higherIsBetter: true },
  { key: 'weight', label: '板块权重', getValue: (c) => c.weight, format: (v) => v.toFixed(1) + '%', higherIsBetter: true },
]

function getBarWidth(value: number, maxValue: number): number {
  if (maxValue <= 0) return 0
  return Math.max(5, Math.min(100, (Math.abs(value) / Math.abs(maxValue)) * 100))
}

function getRankedCompanies(metric: ComparisonMetric) {
  return [...sectorCompanies.value]
    .filter(c => metric.getValue(c) > 0)
    .sort((a, b) => {
      const va = metric.getValue(a)
      const vb = metric.getValue(b)
      return metric.higherIsBetter ? vb - va : va - vb
    })
}
</script>

<template>
  <div v-if="company && sector">
    <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
      <RouterLink to="/" class="hover:text-[#D4302F] transition-colors">首页</RouterLink>
      <span>/</span>
      <RouterLink :to="`/sector/${sector.id}`" class="hover:text-[#D4302F] transition-colors">{{ sector.nameCn }}</RouterLink>
      <span>/</span>
      <span class="text-slate-700 font-medium">{{ company.nameCn }}</span>
    </nav>

    <div class="bg-white rounded-xl border border-slate-200 p-8 mb-6">
      <div class="flex items-start gap-6">
        <div
          class="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          :style="{ backgroundColor: sector.color }"
        >{{ company.symbol.slice(0, 3) }}</div>
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-2xl font-bold text-slate-900">{{ company.nameCn }}</h2>
            <span class="text-lg text-slate-400">{{ company.name }}</span>
          </div>
          <div class="flex items-center gap-4 mb-4">
            <span class="font-mono font-semibold text-[#D4302F]">{{ company.symbol }}</span>
            <span class="text-sm text-slate-400">{{ sector.nameCn }} · {{ company.subIndustry }}</span>
            <span
              class="text-xs px-2 py-0.5 rounded"
              :class="{
                'bg-purple-50 text-purple-600': company.marketCapCategory === 'Mega',
                'bg-blue-50 text-blue-600': company.marketCapCategory === 'Large',
                'bg-green-50 text-green-600': company.marketCapCategory === 'Mid',
              }"
            >{{ company.marketCapCategory }} Cap</span>
            <span class="text-sm text-slate-400">板块权重 {{ company.weight }}%</span>
          </div>
          <PriceDisplay :price="prices[company.symbol]" size="lg" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2 space-y-6">
        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-3">公司简介</h3>
          <p class="text-slate-600 leading-relaxed">{{ company.description }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-3">竞争壁垒分析</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <MoatBadge v-for="moat in company.moats" :key="moat" :moat="moat" />
          </div>
          <p class="text-slate-600 leading-relaxed">{{ company.competitiveAdvantage }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <h3 class="text-lg font-bold text-slate-900 mb-1">财报数据</h3>
          <p class="text-xs text-slate-400 mb-4">鼠标悬停指标名称查看含义与参考标准</p>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="field in financialFields" :key="field.key" class="bg-slate-50 rounded-lg p-4 relative group">
              <div class="flex items-center gap-1.5 mb-1 cursor-help">
                <span class="text-sm text-slate-500 group-hover:text-[#D4302F] transition-colors">{{ field.label }}</span>
                <svg class="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D4302F] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
                <!-- Tooltip -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <p class="leading-relaxed mb-2">{{ field.desc }}</p>
                  <div class="pt-2 border-t border-slate-600">
                    <span class="text-slate-400">参考：</span>
                    <span class="text-green-300">{{ field.ref }}</span>
                  </div>
                  <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
              <div class="text-lg font-bold text-slate-900">{{ formatFinancialValue(field.key, (company.financials as any)[field.key]) }}</div>
              <div v-if="typeof (company.financials as any)[field.key] === 'string'" class="text-xs text-slate-400 mt-0.5">{{ field.unit }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <h3 class="text-base font-bold text-slate-900 mb-3">板块地位</h3>
          <div class="space-y-3">
            <div>
              <div class="text-sm text-slate-500 mb-1">所属板块</div>
              <RouterLink :to="`/sector/${sector.id}`" class="text-[#D4302F] font-medium hover:underline">{{ sector.icon }} {{ sector.nameCn }}</RouterLink>
            </div>
            <div>
              <div class="text-sm text-slate-500 mb-1">子行业</div>
              <div class="font-medium text-slate-900">{{ company.subIndustry }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500 mb-1">板块权重</div>
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div class="h-full rounded-full bar-fill" :style="{ width: Math.min(company.weight * 4, 100) + '%', backgroundColor: sector.color }"></div>
                </div>
                <span class="font-bold text-slate-900 text-sm">{{ company.weight }}%</span>
              </div>
            </div>
            <div>
              <div class="text-sm text-slate-500 mb-1">板块内排名</div>
              <div class="font-medium text-slate-900">
                第 {{ sectorCompanies.sort((a, b) => b.weight - a.weight).findIndex(c => c.symbol === company!.symbol) + 1 }} / {{ sectorCompanies.length }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <h3 class="text-base font-bold text-slate-900 mb-3">外部数据</h3>
          <p class="text-xs text-slate-400 mb-3">跳转至外部平台查看实时财报与行情</p>
          <div class="space-y-2">
            <a :href="getEastMoneyUrl(company.symbol)" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm text-slate-600 hover:text-[#D4302F] transition-colors py-1.5 px-3 rounded-lg hover:bg-red-50 group">
              <span class="text-base">📊</span>
              <span>东方财富</span>
              <svg class="w-3 h-3 text-slate-300 group-hover:text-[#D4302F] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
            <a :href="getTonghuashunUrl(company.symbol)" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm text-slate-600 hover:text-[#D4302F] transition-colors py-1.5 px-3 rounded-lg hover:bg-red-50 group">
              <span class="text-base">📈</span>
              <span>同花顺</span>
              <svg class="w-3 h-3 text-slate-300 group-hover:text-[#D4302F] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
            <a :href="getXueqiuUrl(company.symbol)" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm text-slate-600 hover:text-[#D4302F] transition-colors py-1.5 px-3 rounded-lg hover:bg-red-50 group">
              <span class="text-base">💬</span>
              <span>雪球</span>
              <svg class="w-3 h-3 text-slate-300 group-hover:text-[#D4302F] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-6">
          <h3 class="text-base font-bold text-slate-900 mb-3">同板块公司</h3>
          <div class="space-y-2 max-h-80 overflow-y-auto">
            <RouterLink
              v-for="c in sectorCompanies.sort((a, b) => b.weight - a.weight)"
              :key="c.symbol"
              :to="`/company/${c.symbol}`"
              class="flex items-center gap-2 py-1.5 px-2 rounded text-sm transition-colors"
              :class="c.symbol === company.symbol ? 'bg-red-50 text-[#D4302F] font-medium' : 'text-slate-600 hover:bg-slate-50'"
            >
              <span class="font-mono text-xs w-14">{{ c.symbol }}</span>
              <span class="flex-1 truncate">{{ c.nameCn }}</span>
              <span class="text-xs text-slate-400">{{ c.weight }}%</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 bg-white rounded-xl border border-slate-200 p-8">
      <h3 class="text-lg font-bold text-slate-900 mb-2">同板块对比</h3>
      <p class="text-sm text-slate-500 mb-6">{{ company.nameCn }} 与 {{ sector.nameCn }} 板块其他公司的关键指标对比</p>
      <div class="space-y-8">
        <div v-for="metric in comparisonMetrics" :key="metric.key">
          <h4 class="text-sm font-semibold text-slate-700 mb-3">{{ metric.label }}</h4>
          <div class="space-y-2">
            <div v-for="(c, index) in getRankedCompanies(metric)" :key="c.symbol" class="flex items-center gap-3">
              <span class="text-xs font-mono text-slate-400 w-5 text-right">#{{ index + 1 }}</span>
              <RouterLink
                :to="`/company/${c.symbol}`"
                class="text-sm w-28 truncate flex-shrink-0"
                :class="c.symbol === company.symbol ? 'font-bold text-[#D4302F]' : 'text-slate-600 hover:text-[#D4302F]'"
              >{{ c.nameCn }}</RouterLink>
              <div class="flex-1 flex items-center gap-2">
                <div class="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden relative">
                  <div
                    class="h-full rounded-full bar-fill flex items-center justify-end pr-2"
                    :style="{
                      width: getBarWidth(metric.getValue(c), metric.getValue(getRankedCompanies(metric)[0])) + '%',
                      backgroundColor: c.symbol === company.symbol ? sector.color : sector.color + '40',
                    }"
                  >
                    <span
                      v-if="getBarWidth(metric.getValue(c), metric.getValue(getRankedCompanies(metric)[0])) > 20"
                      class="text-xs font-medium"
                      :class="c.symbol === company.symbol ? 'text-white' : 'text-slate-600'"
                    >{{ metric.format(metric.getValue(c)) }}</span>
                  </div>
                </div>
                <span
                  v-if="getBarWidth(metric.getValue(c), metric.getValue(getRankedCompanies(metric)[0])) <= 20"
                  class="text-xs text-slate-500 font-medium w-16"
                >{{ metric.format(metric.getValue(c)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <p class="text-slate-400 text-lg">公司不存在</p>
    <RouterLink to="/" class="text-[#D4302F] hover:underline mt-4 inline-block">返回首页</RouterLink>
  </div>
</template>
