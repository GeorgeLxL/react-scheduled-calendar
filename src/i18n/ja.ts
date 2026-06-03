import type { CalendarMessages } from '../types';

export const ja: CalendarMessages = {
  prev: { day: '‹ 前日', week: '‹ 前週', month: '‹ 前月' },
  next: { day: '翌日 ›', week: '翌週 ›', month: '翌月 ›' },
  today: '今日',
  view: { day: '日', week: '週', month: '月' },
  more: (n: number) => `+${n}件`,
  noOptions: '該当なし',
  loading: '読み込み中...',
  copy: 'コピー',
  cut: '移動',
  paste: '貼り付け',
  delete: '削除',
  create: '作成',
  popover: {
    titlePlaceholder: 'タイトル',
    create: '作成',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    color: '色',
    start: '開始',
    end: '終了',
  },
};
