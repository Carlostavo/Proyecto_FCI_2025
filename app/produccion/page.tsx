import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"

export const dynamic = 'force-dynamic'

export default async function ProduccionPage() {
  return <RoleAwareModulePage moduleKey="produccion" />
}
