import type { CalendarMessages } from '../types';

export const en: CalendarMessages = {
  prev: { day: '‹ Prev', week: '‹ Prev week', month: '‹ Prev month' },
  next: { day: 'Next ›', week: 'Next week ›', month: 'Next month ›' },
  today: 'Today',
  view: { day: 'Day', week: 'Week', month: 'Month' },
  more: (n: number) => `+${n} more`,
  noOptions: 'No options',
  loading: 'Loading…',
  copy: 'Copy',
  cut: 'Cut',
  paste: 'Paste',
  delete: 'Delete',
  create: 'Create',
  popover: {
    titlePlaceholder: 'Title',
    create: 'Create',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    color: 'Color',
    start: 'Start',
    end: 'End',
  },
};
