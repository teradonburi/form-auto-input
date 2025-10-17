"use client"

import type React from "react"

import { useState } from "react"

import { GraduationCap, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface SchoolFormPageProps {
  onBack: () => void
}

export default function SchoolFormPage({ onBack }: SchoolFormPageProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "送信完了",
      description: "お申し込みありがとうございます。入学案内を郵送いたします。",
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
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-2">
                <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-2xl">学校入学申込</CardTitle>
            </div>
            <CardDescription>入学に必要な情報をご記入ください。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">生徒情報</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentLastName">姓 *</Label>
                    <Input id="studentLastName" required placeholder="山田" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentFirstName">名 *</Label>
                    <Input id="studentFirstName" required placeholder="太郎" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentLastNameKana">セイ *</Label>
                    <Input id="studentLastNameKana" required placeholder="ヤマダ" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentFirstNameKana">メイ *</Label>
                    <Input id="studentFirstNameKana" required placeholder="タロウ" />
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
              </div>

              {/* Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">保護者情報</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">保護者氏名 *</Label>
                    <Input id="guardianName" required placeholder="山田 花子" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">続柄 *</Label>
                    <Select required>
                      <SelectTrigger id="relationship">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">父</SelectItem>
                        <SelectItem value="mother">母</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">住所 *</Label>
                  <Input id="address" required placeholder="東京都渋谷区..." />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">電話番号 *</Label>
                    <Input id="guardianPhone" type="tel" required placeholder="090-1234-5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianEmail">メールアドレス *</Label>
                    <Input id="guardianEmail" type="email" required placeholder="example@email.com" />
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">申込内容</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="grade">希望学年 *</Label>
                    <Select required>
                      <SelectTrigger id="grade">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1年生</SelectItem>
                        <SelectItem value="2">2年生</SelectItem>
                        <SelectItem value="3">3年生</SelectItem>
                        <SelectItem value="4">4年生</SelectItem>
                        <SelectItem value="5">5年生</SelectItem>
                        <SelectItem value="6">6年生</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">入学希望時期 *</Label>
                    <Select required>
                      <SelectTrigger id="startDate">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="april">4月</SelectItem>
                        <SelectItem value="september">9月</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>希望するプログラム</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="regular" />
                    <Label htmlFor="regular" className="font-normal cursor-pointer">
                      通常プログラム
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="advanced" />
                    <Label htmlFor="advanced" className="font-normal cursor-pointer">
                      特進プログラム
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="international" />
                    <Label htmlFor="international" className="font-normal cursor-pointer">
                      国際プログラム
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivation">志望動機</Label>
                  <Textarea id="motivation" placeholder="入学を希望される理由をご記入ください" rows={4} />
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
