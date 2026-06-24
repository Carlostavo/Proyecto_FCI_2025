import { AppShell } from "@/components/dashboard/app-shell"
import { ScientificProductionManager } from "@/components/production/scientific-production-manager"
import { getInvestigators, getScientificProducts } from "@/lib/scientific-production"

export default async function ProduccionPage() {
  const [products, investigators] = await Promise.all([getScientificProducts(), getInvestigators()])
  return <AppShell><ScientificProductionManager products={products} investigators={investigators} /></AppShell>
}
