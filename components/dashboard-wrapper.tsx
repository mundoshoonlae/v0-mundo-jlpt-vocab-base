import { Dashboard } from "@/components/dashboard"
import { getVocabList, getVocabCount } from "@/app/actions"

export async function DashboardWrapper() {
  const [vocabList, vocabCount] = await Promise.all([
    getVocabList(),
    getVocabCount(),
  ])

  return <Dashboard initialVocabList={vocabList} initialCount={vocabCount} />
}
