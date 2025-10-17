"use client"

import type React from "react"

import { useState } from "react"

import { Wrench, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function RepairFormPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "送信完了",
      description: "お問い合わせありがとうございます。担当者より1営業日以内にご連絡いたします。",
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
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-2">
                <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl">修理・メンテナンス依頼</CardTitle>
            </div>
            <CardDescription>迅速かつ丁寧な修理サービスをご提供いたします。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">お客様情報</h3>
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
                  <Label htmlFor="address">住所 *</Label>
                  <Input id="address" required placeholder="東京都渋谷区..." />
                </div>
              </div>

              {/* Repair Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">修理内容</h3>
                <div className="space-y-2">
                  <Label htmlFor="category">修理カテゴリー *</Label>
                  <Select required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">水回り（水漏れ・詰まり等）</SelectItem>
                      <SelectItem value="electrical">電気設備</SelectItem>
                      <SelectItem value="aircon">エアコン</SelectItem>
                      <SelectItem value="door">ドア・鍵</SelectItem>
                      <SelectItem value="window">窓・ガラス</SelectItem>
                      <SelectItem value="wall">壁・床</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">緊急度 *</Label>
                  <Select required>
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">緊急（即日対応希望）</SelectItem>
                      <SelectItem value="urgent">至急（2-3日以内）</SelectItem>
                      <SelectItem value="normal">通常（1週間以内）</SelectItem>
                      <SelectItem value="flexible">相談したい</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">症状の詳細 *</Label>
                  <Textarea
                    id="description"
                    required
                    placeholder="具体的な症状や状況をできるだけ詳しくご記入ください"
                    rows={5}
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">訪問希望日時</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="visitDate">希望日 *</Label>
                    <Input id="visitDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visitTime">希望時間帯 *</Label>
                    <Select required>
                      <SelectTrigger id="visitTime">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">午前（9:00-12:00）</SelectItem>
                        <SelectItem value="afternoon">午後（13:00-17:00）</SelectItem>
                        <SelectItem value="evening">夕方（17:00-19:00）</SelectItem>
                        <SelectItem value="anytime">いつでも可</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">その他連絡事項</Label>
                  <Textarea id="notes" placeholder="駐車場の有無、入室方法など" rows={3} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "送信する"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
