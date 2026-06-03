import type { CalendarMessages } from '../types';

export const es: CalendarMessages = {
  prev: { day: '‹ Día anterior', week: '‹ Semana anterior', month: '‹ Mes anterior' },
  next: { day: 'Día siguiente ›', week: 'Semana siguiente ›', month: 'Mes siguiente ›' },
  today: 'Hoy',
  view: { day: 'Día', week: 'Semana', month: 'Mes' },
  more: (n: number) => `+${n} más`,
  noOptions: 'Sin resultados',
  loading: 'Cargando…',
  copy: 'Copiar',
  cut: 'Cortar',
  paste: 'Pegar',
  delete: 'Eliminar',
  create: 'Crear',
  popover: {
    titlePlaceholder: 'Título',
    create: 'Crear',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    color: 'Color',
    start: 'Inicio',
    end: 'Fin',
  },
};
