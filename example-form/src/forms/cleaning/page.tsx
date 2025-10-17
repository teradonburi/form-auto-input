"use client"

import type React from "react"

import { useState } from "react"

import { Sparkles, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function CleaningFormPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "送信完了",
      description: "お問い合わせありがとうございます。担当者より2営業日以内にご連絡いたします。",
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
              <div className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 p-2">
                <Sparkles className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle className="text-2xl">ハウスクリーニング予約</CardTitle>
            </div>
            <CardDescription>プロのクリーニングサービスで快適な空間を実現します。</CardDescription>
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

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">サービス内容</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="kitchen" />
                    <Label htmlFor="kitchen" className="font-normal cursor-pointer">
                      キッチンクリーニング
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="bathroom" />
                    <Label htmlFor="bathroom" className="font-normal cursor-pointer">
                      浴室クリーニング
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="toilet" />
                    <Label htmlFor="toilet" className="font-normal cursor-pointer">
                      トイレクリーニング
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="aircon" />
                    <Label htmlFor="aircon" className="font-normal cursor-pointer">
                      エアコンクリーニング
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="whole" />
                    <Label htmlFor="whole" className="font-normal cursor-pointer">
                      全体クリーニング
                    </Label>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">物件タイプ *</Label>
                    <Select required>
                      <SelectTrigger id="propertyType">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">マンション</SelectItem>
                        <SelectItem value="house">一戸建て</SelectItem>
                        <SelectItem value="office">オフィス</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">広さ *</Label>
                    <Select required>
                      <SelectTrigger id="size">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">〜50㎡</SelectItem>
                        <SelectItem value="medium">50〜80㎡</SelectItem>
                        <SelectItem value="large">80〜120㎡</SelectItem>
                        <SelectItem value="xlarge">120㎡以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">希望日時</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">第一希望日 *</Label>
                    <Input id="preferredDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">希望時間帯 *</Label>
                    <Select required>
                      <SelectTrigger id="preferredTime">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">午前（9:00-12:00）</SelectItem>
                        <SelectItem value="afternoon">午後（13:00-17:00）</SelectItem>
                        <SelectItem value="evening">夕方（17:00-20:00）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">その他ご要望</Label>
                  <Textarea id="notes" placeholder="特別な清掃箇所や注意事項などがあればご記入ください" rows={4} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "予約する"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
