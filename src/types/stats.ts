export interface Stats {
  /** フレックス残高（＋超過／−不足）h */
  flexBalanceHours: number;

  /** 当月の累計実働時間 h */
  totalWorkedHours: number;

  /** 当月の所定（基準）労働時間 h */
  scheduledHours: number;

  /** 出勤済み日の平均実働 h/日 */
  averageWorkedHoursPerDay: number;

  /** 残り必要最低勤務時間 h */
  remainingScheduledHours: number;

  /** 残り勤務日数（日） */
  remainingWorkDays: number;

  /** 目標達成に必要な 1 日あたり平均勤務 h/日 */
  requiredDailyAverage: number;

  /** 今日の退勤目安 ("HH:MM") */
  todayTargetExitTime?: string;

  /** 当月の総勤務日数（日） */
  totalWorkDays: number;

  /** 既に勤務した日数（日） */
  completedWorkDays: number;

  /** 36 協定上限までの残業可能時間 h */
  remainingOvertimeHours: number;

  /** 当月の最大許容実働時間 (所定 + 36 協定上限) h */
  maxAllowedWorkHours: number;
}
