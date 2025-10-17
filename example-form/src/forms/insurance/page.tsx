"use client"

import type React from "react"

import { useState } from "react"

import { Shield, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface InsuranceFormPageProps {
  onBack: () => void
}

export default function InsuranceFormPage({ onBack }: InsuranceFormPageProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "送信完了",
      description: "お見積もり依頼ありがとうございます。2営業日以内にご連絡いたします。",
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
              <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 p-2">
                <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-2xl">保険見積もり依頼</CardTitle>
            </div>
            <CardDescription>最適な保険プランをご提案いたします。</CardDescription>
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

              {/* Insurance Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">保険種類</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="life" />
                    <Label htmlFor="life" className="font-normal cursor-pointer">
                      生命保険
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="medical" />
                    <Label htmlFor="medical" className="font-normal cursor-pointer">
                      医療保険
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cancer" />
                    <Label htmlFor="cancer" className="font-normal cursor-pointer">
                      がん保険
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto" />
                    <Label htmlFor="auto" className="font-normal cursor-pointer">
                      自動車保険
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="fire" />
                    <Label htmlFor="fire" className="font-normal cursor-pointer">
                      火災保険
                    </Label>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">現在の状況</h3>
                <div className="space-y-2">
                  <Label htmlFor="occupation">職業 *</Label>
                  <Input id="occupation" required placeholder="会社員、自営業など" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">婚姻状況 *</Label>
                    <Select required>
                      <SelectTrigger id="maritalStatus">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">独身</SelectItem>
                        <SelectItem value="married">既婚</SelectItem>
                        <SelectItem value="divorced">離婚</SelectItem>
                        <SelectItem value="widowed">死別</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dependents">扶養家族数 *</Label>
                    <Select required>
                      <SelectTrigger id="dependents">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0名</SelectItem>
                        <SelectItem value="1">1名</SelectItem>
                        <SelectItem value="2">2名</SelectItem>
                        <SelectItem value="3">3名</SelectItem>
                        <SelectItem value="4+">4名以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentInsurance">現在加入中の保険</Label>
                  <Textarea id="currentInsurance" placeholder="加入中の保険があればご記入ください" rows={3} />
                </div>
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">健康状態</h3>
                <div className="space-y-2">
                  <Label htmlFor="smoking">喫煙状況 *</Label>
                  <Select required>
                    <SelectTrigger id="smoking">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-smoker">非喫煙者</SelectItem>
                      <SelectItem value="smoker">喫煙者</SelectItem>
                      <SelectItem value="quit">禁煙中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="healthCondition">既往症・持病</Label>
                  <Textarea
                    id="healthCondition"
                    placeholder="過去5年以内の病歴や現在治療中の病気があればご記入ください"
                    rows={3}
                  />
                </div>
              </div>

              {/* Consultation Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">相談希望</h3>
                <div className="space-y-2">
                  <Label htmlFor="budget">月額予算 *</Label>
                  <Select required>
                    <SelectTrigger id="budget">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5000">〜5,000円</SelectItem>
                      <SelectItem value="10000">5,000円〜10,000円</SelectItem>
                      <SelectItem value="20000">10,000円〜20,000円</SelectItem>
                      <SelectItem value="30000">20,000円〜30,000円</SelectItem>
                      <SelectItem value="30001">30,000円以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactMethod">希望連絡方法 *</Label>
                  <Select required>
                    <SelectTrigger id="contactMethod">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">メール</SelectItem>
                      <SelectItem value="phone">電話</SelectItem>
                      <SelectItem value="both">どちらでも可</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">その他ご要望</Label>
                  <Textarea id="notes" placeholder="保険に関するご質問やご要望をご記入ください" rows={4} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "送信中..." : "見積もりを依頼する"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
