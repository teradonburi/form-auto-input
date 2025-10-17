"use client"

import type React from "react"

import { useState } from "react"

import { Dumbbell, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface GymFormPageProps {
  onBack: () => void
}

export default function GymFormPage({ onBack }: GymFormPageProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "送信完了",
      description: "会員登録ありがとうございます。入会手続きのご案内をお送りします。",
    })

    setIsSubmitting(false)
    onBack()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            フォーム一覧に戻る
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2">
                <Dumbbell className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">ジム会員登録</CardTitle>
            </div>
            <CardDescription>健康的なライフスタイルを始めましょう。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">会員情報</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">姓 *</Label>
                    <Input id="lastName" required placeholder="山田" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">名 *</Label>
                    <Input id="firstName" required placeholder="太郎" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lastNameKana">セイ *</Label>
                    <Input id="lastNameKana" required placeholder="ヤマダ" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstNameKana">メイ *</Label>
                    <Input id="firstNameKana" required placeholder="タロウ" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">生年月日 *</Label>
                    <Input id="birthDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">性別 *</Label>
                    <Select required>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">男性</SelectItem>
                        <SelectItem value="female">女性</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス *</Label>
                    <Input id="email" type="email" required placeholder="example@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号 *</Label>
                    <Input id="phone" type="tel" required placeholder="090-1234-5678" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">住所 *</Label>
                  <Input id="address" required placeholder="東京都渋谷区..." />
                </div>
              </div>

              {/* Membership Plan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">プラン選択</h3>
                <div className="space-y-2">
                  <Label htmlFor="plan">会員プラン *</Label>
                  <Select required>
                    <SelectTrigger id="plan">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">ベーシック（月8回）- 8,000円/月</SelectItem>
                      <SelectItem value="standard">スタンダード（通い放題）- 12,000円/月</SelectItem>
                      <SelectItem value="premium">プレミアム（通い放題+パーソナル）- 20,000円/月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">希望店舗 *</Label>
                  <Select required>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shibuya">渋谷店</SelectItem>
                      <SelectItem value="shinjuku">新宿店</SelectItem>
                      <SelectItem value="ikebukuro">池袋店</SelectItem>
                      <SelectItem value="yokohama">横浜店</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">利用開始希望日 *</Label>
                  <Input id="startDate" type="date" required />
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">オプション</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="locker" />
                    <Label htmlFor="locker" className="font-normal cursor-pointer">
                      専用ロッカー（+1,000円/月）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="towel" />
                    <Label htmlFor="towel" className="font-normal cursor-pointer">
                      タオルレンタル（+500円/月）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="water" />
                    <Label htmlFor="water" className="font-normal cursor-pointer">
                      ウォーターサーバー利用（+300円/月）
                    </Label>
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">健康情報</h3>
                <div className="space-y-2">
                  <Label htmlFor="healthCondition">持病・アレルギー等</Label>
                  <Textarea
                    id="healthCondition"
                    placeholder="運動に支障がある健康上の問題があればご記入ください"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">トレーニング目標</Label>
                  <Textarea id="goals" placeholder="ダイエット、筋力アップ、健康維持など" rows={3} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "登録する"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
