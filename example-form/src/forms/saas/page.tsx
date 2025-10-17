"use client"

import type React from "react"

import { useState } from "react"

import { Briefcase, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function SaaSFormPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
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
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-2">
                <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl">業務用SaaS問い合わせ</CardTitle>
            </div>
            <CardDescription>貴社のビジネス課題を解決するソリューションをご提案いたします。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">会社情報</h3>
                <div className="space-y-2">
                  <Label htmlFor="companyName">会社名 *</Label>
                  <Input id="companyName" required placeholder="株式会社サンプル" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">業種 *</Label>
                    <Select required>
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">IT・通信</SelectItem>
                        <SelectItem value="manufacturing">製造業</SelectItem>
                        <SelectItem value="retail">小売・卸売</SelectItem>
                        <SelectItem value="finance">金融・保険</SelectItem>
                        <SelectItem value="service">サービス業</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employees">従業員数 *</Label>
                    <Select required>
                      <SelectTrigger id="employees">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1〜10名</SelectItem>
                        <SelectItem value="11-50">11〜50名</SelectItem>
                        <SelectItem value="51-200">51〜200名</SelectItem>
                        <SelectItem value="201-1000">201〜1,000名</SelectItem>
                        <SelectItem value="1001+">1,001名以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">ご担当者様情報</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">お名前 *</Label>
                    <Input id="contactName" required placeholder="山田 太郎" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">部署名</Label>
                    <Input id="department" placeholder="営業部" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス *</Label>
                    <Input id="email" type="email" required placeholder="example@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号 *</Label>
                    <Input id="phone" type="tel" required placeholder="03-1234-5678" />
                  </div>
                </div>
              </div>

              {/* Service Interest */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">ご興味のあるサービス</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="crm" />
                    <Label htmlFor="crm" className="font-normal cursor-pointer">
                      CRM（顧客管理）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="accounting" />
                    <Label htmlFor="accounting" className="font-normal cursor-pointer">
                      会計・経理システム
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="hr" />
                    <Label htmlFor="hr" className="font-normal cursor-pointer">
                      人事・労務管理
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="marketing" />
                    <Label htmlFor="marketing" className="font-normal cursor-pointer">
                      マーケティングオートメーション
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="project" />
                    <Label htmlFor="project" className="font-normal cursor-pointer">
                      プロジェクト管理
                    </Label>
                  </div>
                </div>
              </div>

              {/* Budget and Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">導入について</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget">予算感 *</Label>
                    <Select required>
                      <SelectTrigger id="budget">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50000">〜5万円/月</SelectItem>
                        <SelectItem value="100000">5万円〜10万円/月</SelectItem>
                        <SelectItem value="300000">10万円〜30万円/月</SelectItem>
                        <SelectItem value="500000">30万円〜50万円/月</SelectItem>
                        <SelectItem value="500001">50万円以上/月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeline">導入希望時期 *</Label>
                    <Select required>
                      <SelectTrigger id="timeline">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">すぐに</SelectItem>
                        <SelectItem value="1month">1ヶ月以内</SelectItem>
                        <SelectItem value="3months">3ヶ月以内</SelectItem>
                        <SelectItem value="6months">6ヶ月以内</SelectItem>
                        <SelectItem value="undecided">未定</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inquiry">お問い合わせ内容 *</Label>
                  <Textarea
                    id="inquiry"
                    required
                    placeholder="現在の課題や導入したい機能などをご記入ください"
                    rows={5}
                  />
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
