"use client"

import type React from "react"

import { useState } from "react"

import { Calendar, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function SeminarFormPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "送信完了",
      description: "セミナーのお申し込みありがとうございます。詳細をメールでお送りします。",
    })

    setIsSubmitting(false)
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            フォーム一覧に戻る
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2">
                <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl">セミナー申込</CardTitle>
            </div>
            <CardDescription>ビジネススキル向上のためのセミナーにご参加ください。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Participant Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">参加者情報</h3>
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
                    <Label htmlFor="email">メールアドレス *</Label>
                    <Input id="email" type="email" required placeholder="example@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号 *</Label>
                    <Input id="phone" type="tel" required placeholder="090-1234-5678" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">会社名</Label>
                  <Input id="company" placeholder="株式会社サンプル" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">部署名</Label>
                    <Input id="department" placeholder="営業部" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">役職</Label>
                    <Input id="position" placeholder="課長" />
                  </div>
                </div>
              </div>

              {/* Seminar Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">セミナー選択</h3>
                <div className="space-y-2">
                  <Label htmlFor="seminar">参加希望セミナー *</Label>
                  <Select required>
                    <SelectTrigger id="seminar">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leadership">リーダーシップ研修</SelectItem>
                      <SelectItem value="marketing">デジタルマーケティング基礎</SelectItem>
                      <SelectItem value="sales">営業スキルアップ講座</SelectItem>
                      <SelectItem value="management">プロジェクトマネジメント</SelectItem>
                      <SelectItem value="communication">ビジネスコミュニケーション</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">希望日程 *</Label>
                    <Select required>
                      <SelectTrigger id="date">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025-11-15">2025年11月15日（土）</SelectItem>
                        <SelectItem value="2025-11-22">2025年11月22日（土）</SelectItem>
                        <SelectItem value="2025-11-29">2025年11月29日（土）</SelectItem>
                        <SelectItem value="2025-12-06">2025年12月6日（土）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participants">参加人数 *</Label>
                    <Select required>
                      <SelectTrigger id="participants">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1名</SelectItem>
                        <SelectItem value="2">2名</SelectItem>
                        <SelectItem value="3">3名</SelectItem>
                        <SelectItem value="4">4名</SelectItem>
                        <SelectItem value="5+">5名以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">オプション</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="lunch" />
                    <Label htmlFor="lunch" className="font-normal cursor-pointer">
                      ランチ付き（+2,000円）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="materials" />
                    <Label htmlFor="materials" className="font-normal cursor-pointer">
                      教材セット（+3,000円）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="certificate" />
                    <Label htmlFor="certificate" className="font-normal cursor-pointer">
                      修了証発行（+1,000円）
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietary">食事制限・アレルギー</Label>
                  <Input id="dietary" placeholder="ベジタリアン、アレルギーなど" />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">その他</h3>
                <div className="space-y-2">
                  <Label htmlFor="motivation">参加動機</Label>
                  <Textarea id="motivation" placeholder="セミナーに期待することをご記入ください" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questions">質問・要望</Label>
                  <Textarea id="questions" placeholder="事前に確認したいことがあればご記入ください" rows={3} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "申し込む"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
