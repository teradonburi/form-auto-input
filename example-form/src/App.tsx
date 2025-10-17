import { useState, useEffect } from 'react'
import {
  Building2,
  Briefcase,
  Dumbbell,
  Calendar,
  Sparkles,
  GraduationCap,
  Shield,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import RentalFormPage from './forms/rental/page'
import GymFormPage from './forms/gym/page'
import SeminarFormPage from './forms/seminar/page'
import CleaningFormPage from './forms/cleaning/page'
import SchoolFormPage from './forms/school/page'
import SaasFormPage from './forms/saas/page'
import InsuranceFormPage from './forms/insurance/page'
import RepairFormPage from './forms/repair/page'

const formTypes = [
  {
    id: "rental",
    title: "賃貸物件検索",
    description: "理想の住まいを見つけましょう",
    icon: Building2,
    color: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "gym",
    title: "ジム会員登録",
    description: "健康的なライフスタイルを始めましょう",
    icon: Dumbbell,
    color: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    id: "insurance",
    title: "保険相談申込",
    description: "最適な保険プランをご提案",
    icon: Shield,
    color: "bg-cyan-50 dark:bg-cyan-950/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "seminar",
    title: "セミナー参加申込",
    description: "スキルアップセミナーに参加しましょう",
    icon: Calendar,
    color: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "cleaning",
    title: "ハウスクリーニング予約",
    description: "プロの清掃サービス",
    icon: Sparkles,
    color: "bg-pink-50 dark:bg-pink-950/30",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    id: "school",
    title: "オンラインスクール申込",
    description: "新しいスキルを学びましょう",
    icon: GraduationCap,
    color: "bg-indigo-50 dark:bg-indigo-950/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "saas",
    title: "業務用SaaS問い合わせ",
    description: "ビジネスソリューションのご相談",
    icon: Briefcase,
    color: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "repair",
    title: "修理サービス申込",
    description: "家電・住宅設備の修理",
    icon: Wrench,
    color: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
]

type FormId = "rental" | "gym" | "insurance" | "seminar" | "cleaning" | "school" | "saas" | "repair" | null

function App() {
  const [currentForm, setCurrentForm] = useState<FormId>(null)
  const [showVideoDialog, setShowVideoDialog] = useState(false)

  useEffect(() => {
    // フォームが選択されたときに動画ダイアログを表示
    if (currentForm) {
      setShowVideoDialog(true)
    }
  }, [currentForm])

  const handleBack = () => setCurrentForm(null)

  const renderForm = () => {
    switch (currentForm) {
      case 'rental':
        return <RentalFormPage onBack={handleBack} />
      case 'gym':
        return <GymFormPage onBack={handleBack} />
      case 'insurance':
        return <InsuranceFormPage onBack={handleBack} />
      case 'seminar':
        return <SeminarFormPage onBack={handleBack} />
      case 'cleaning':
        return <CleaningFormPage onBack={handleBack} />
      case 'school':
        return <SchoolFormPage onBack={handleBack} />
      case 'saas':
        return <SaasFormPage onBack={handleBack} />
      case 'repair':
        return <RepairFormPage onBack={handleBack} />
      default:
        return (
          <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
              <div className="container mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold text-foreground">フォームセレクター</h1>
                <p className="mt-2 text-muted-foreground">目的に合わせたフォームをお選びください</p>
              </div>
            </header>

            <main className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {formTypes.map((form) => {
                  const Icon = form.icon
                  return (
                    <div
                      key={form.id}
                      onClick={() => setCurrentForm(form.id as FormId)}
                      className="group cursor-pointer"
                    >
                      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                        <CardContent className="flex flex-col items-center p-6 text-center">
                          <div className={`mb-4 rounded-xl p-4 ${form.color} transition-transform group-hover:scale-110`}>
                            <Icon className={`h-8 w-8 ${form.iconColor}`} />
                          </div>
                          <h2 className="mb-2 text-lg font-semibold text-foreground">{form.title}</h2>
                          <p className="text-sm text-muted-foreground">{form.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </main>

            <footer className="mt-16 border-t border-border bg-card">
              <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                <p>© 2025 フォームセレクター. All rights reserved.</p>
              </div>
            </footer>
          </div>
        )
    }
  }

  return (
    <>
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-[80vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-3xl">フォームの使い方</DialogTitle>
            <DialogDescription className="text-lg">
              こちらの動画でフォームの入力方法をご説明いたします
            </DialogDescription>
          </DialogHeader>
          <div className="w-full" style={{ aspectRatio: '16/9' }}>
            <video
              className="w-full h-full rounded-lg"
              controls
              autoPlay
              src="/video/girl.mp4"
            >
              お使いのブラウザは動画タグをサポートしていません。
            </video>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowVideoDialog(false)} className="text-lg px-6 py-3">
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {renderForm()}
      <Toaster />
    </>
  )
}

export default App
