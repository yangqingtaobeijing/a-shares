import { foodBeverageCompanies } from './food-beverage'
import { healthcareCompanies } from './healthcare'
import { electronicsCompanies } from './electronics'
import { powerEquipmentCompanies } from './power-equipment'
import { bankingCompanies } from './banking'
import { nonbankFinancialsCompanies } from './nonbank-financials'
import { automotiveCompanies } from './automotive'
import { itSoftwareCompanies } from './it-software'
import { realEstateCompanies } from './real-estate'
import { chemicalsCompanies } from './chemicals'
import { metalsCompanies } from './metals'
import { defenseCompanies } from './defense'
import type { Company } from '../../types'

export const companiesBySector: Record<string, Company[]> = {
  'food-beverage': foodBeverageCompanies,
  'healthcare': healthcareCompanies,
  'electronics': electronicsCompanies,
  'power-equipment': powerEquipmentCompanies,
  'banking': bankingCompanies,
  'nonbank-financials': nonbankFinancialsCompanies,
  'automotive': automotiveCompanies,
  'it-software': itSoftwareCompanies,
  'real-estate': realEstateCompanies,
  'chemicals': chemicalsCompanies,
  'metals': metalsCompanies,
  'defense': defenseCompanies,
}

export const allCompanies: Company[] = Object.values(companiesBySector).flat()

export function getCompanyBySymbol(symbol: string): Company | undefined {
  return allCompanies.find(c => c.symbol === symbol)
}

export function getCompaniesBySector(sectorId: string): Company[] {
  return companiesBySector[sectorId] || []
}
