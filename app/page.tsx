import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { ProjectTimeChart } from "@/components/dashboard/project-time-chart"
import { ResearcherProductionChart } from "@/components/dashboard/researcher-production-chart"
import { CompetenciesHeatmap } from "@/components/dashboard/competencies-heatmap"
import { TrainingNeedsChart } from "@/components/dashboard/training-needs-chart"
import { CourseStatusChart } from "@/components/dashboard/course-status-chart"
import { UpcomingActivities } from "@/components/dashboard/upcoming-activities"

export default async function Page() {
  return (
    <AppShell>
      <Toolbar />
      <div className="space-y-4 px-6 pb-8">
        <StatCards />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProjectTimeChart />
          <ResearcherProductionChart />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CompetenciesHeatmap />
          <TrainingNeedsChart />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CourseStatusChart />
          <div className="lg:col-span-2">
            <UpcomingActivities />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
