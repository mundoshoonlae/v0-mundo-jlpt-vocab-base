import { Suspense } from "react"
import { DashboardWrapper } from "@/components/dashboard-wrapper"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardWrapper />
    </Suspense>
  )
}
