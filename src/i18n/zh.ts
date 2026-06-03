import type { CalendarMessages } from '../types';

export const zh: CalendarMessages = {
  prev: { day: '‹ 前一天', week: '‹ 上周', month: '‹ 上个月' },
  next: { day: '后一天 ›', week: '下周 ›', month: '下个月 ›' },
  today: '今天',
  view: { day: '日', week: '周', month: '月' },
  more: (n: number) => `+${n} 项`,
  noOptions: '无选项',
  loading: '加载中...',
  copy: '复制',
  cut: '剪切',
  paste: '粘贴',
  delete: '删除',
  create: '新建',
  popover: {
    titlePlaceholder: '标题',
    create: '新建',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    color: '颜色',
    start: '开始',
    end: '结束',
  },
};
