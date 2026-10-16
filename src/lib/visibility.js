// Page visibility (PROJECT_SPEC §6.5). "private" is reserved for future custom access.
export const VISIBILITY_OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    icon: 'globe',
    description: 'Anyone can find it in Explore and search, and open it by its link.',
  },
  {
    value: 'unlisted',
    label: 'Unlisted',
    icon: 'link',
    description: 'Only people with the link can see it. Hidden from Explore, search and recent pages.',
  },
  {
    value: 'private',
    label: 'Private',
    icon: 'lock',
    description: 'Only you and people you choose.',
    comingSoon: true,
  },
];

export const SELECTABLE_VISIBILITY = VISIBILITY_OPTIONS.filter((o) => !o.comingSoon).map((o) => o.value);

/** Pages created before visibility existed have no field: treat them as public. */
export const visibilityOf = (page) => (page?.visibility === 'unlisted' ? 'unlisted' : 'public');
