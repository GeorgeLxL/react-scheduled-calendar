import type { CalendarMessages } from '../types';

export const pt: CalendarMessages = {
  prev: { day: '‹ Dia anterior', week: '‹ Semana anterior', month: '‹ Mês anterior' },
  next: { day: 'Próximo dia ›', week: 'Próxima semana ›', month: 'Próximo mês ›' },
  today: 'Hoje',
  view: { day: 'Dia', week: 'Semana', month: 'Mês' },
  more: (n: number) => `+${n} mais`,
  noOptions: 'Nenhum resultado',
  loading: 'Carregando…',
  copy: 'Copiar',
  cut: 'Recortar',
  paste: 'Colar',
  delete: 'Excluir',
  create: 'Criar',
  popover: {
    titlePlaceholder: 'Título',
    create: 'Criar',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    color: 'Cor',
    start: 'Início',
    end: 'Fim',
  },
};
