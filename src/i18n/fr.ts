import type { CalendarMessages } from '../types';

export const fr: CalendarMessages = {
  prev: { day: '‹ Jour précédent', week: '‹ Semaine précédente', month: '‹ Mois précédent' },
  next: { day: 'Jour suivant ›', week: 'Semaine suivante ›', month: 'Mois suivant ›' },
  today: "Aujourd'hui",
  view: { day: 'Jour', week: 'Semaine', month: 'Mois' },
  more: (n: number) => `+${n} de plus`,
  noOptions: 'Aucun résultat',
  loading: 'Chargement…',
  copy: 'Copier',
  cut: 'Couper',
  paste: 'Coller',
  delete: 'Supprimer',
  create: 'Créer',
  popover: {
    titlePlaceholder: 'Titre',
    create: 'Créer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    color: 'Couleur',
    start: 'Début',
    end: 'Fin',
  },
};
