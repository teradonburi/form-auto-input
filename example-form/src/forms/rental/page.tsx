"use client"

import type React from "react"

import { useState } from "react"

import { Building2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface RentalFormPageProps {
  onBack: () => void
}

export default function RentalFormPage({ onBack }: RentalFormPageProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "送信完了",
      description: "お問い合わせありがとうございます。担当者より3営業日以内にご連絡いたします。",
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
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">賃貸物件検索</CardTitle>
            </div>
            <CardDescription>ご希望の条件をお聞かせください。最適な物件をご提案いたします。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
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
              </div>

              {/* Property Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">物件の希望条件</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="area">希望エリア *</Label>
                    <Select required>
                      <SelectTrigger id="area">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tokyo-23">東京23区</SelectItem>
                        <SelectItem value="tokyo-other">東京都下</SelectItem>
                        <SelectItem value="kanagawa">神奈川県</SelectItem>
                        <SelectItem value="saitama">埼玉県</SelectItem>
                        <SelectItem value="chiba">千葉県</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomType">間取り *</Label>
                    <Select required>
                      <SelectTrigger id="roomType">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1k">1K</SelectItem>
                        <SelectItem value="1dk">1DK</SelectItem>
                        <SelectItem value="1ldk">1LDK</SelectItem>
                        <SelectItem value="2ldk">2LDK</SelectItem>
                        <SelectItem value="3ldk">3LDK以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget">予算（月額） *</Label>
                    <Select required>
                      <SelectTrigger id="budget">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50000">〜5万円</SelectItem>
                        <SelectItem value="70000">5万円〜7万円</SelectItem>
                        <SelectItem value="100000">7万円〜10万円</SelectItem>
                        <SelectItem value="150000">10万円〜15万円</SelectItem>
                        <SelectItem value="150001">15万円以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moveDate">入居希望時期 *</Label>
                    <Input id="moveDate" type="date" required />
                  </div>
                </div>
              </div>

              {/* Additional Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">その他の条件</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pet" />
                    <Label htmlFor="pet" className="font-normal cursor-pointer">
                      ペット可
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="parking" />
                    <Label htmlFor="parking" className="font-normal cursor-pointer">
                      駐車場あり
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="autolock" />
                    <Label htmlFor="autolock" className="font-normal cursor-pointer">
                      オートロック
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="newBuilding" />
                    <Label htmlFor="newBuilding" className="font-normal cursor-pointer">
                      築10年以内
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">その他ご要望</Label>
                  <Textarea id="notes" placeholder="その他のご要望やご質問がございましたらご記入ください" rows={4} />
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
