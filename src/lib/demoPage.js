// Sample article used for the illustrations on the home and auth pages (rendered with the real renderer).

const portrait = '/user_default.png';

export const demoPage = {
  slug: 'sam-singh',
  title: 'Sam Singh',
  shortDescription: 'Indian civil engineer and photographer (born 1987)',
  infobox: {
    name: '',
    image: { url: portrait, alt: '', caption: 'Singh in 2024' },
    birthDate: '1987-08-21',
    birthPlace: 'Jaipur, Rajasthan, India',
    deathDate: null,
    deathPlace: '',
    fields: [
      { label: 'Occupation', value: 'Civil engineer, photographer' },
      { label: 'Alma mater', value: '[[IIT Delhi]]' },
      { label: 'Known for', value: 'Monsoon bridge designs' },
      { label: 'Spouse', value: 'Meera Singh (m. 2014)' },
    ],
  },
  lead:
    "'''Sam Singh''' (born 21 August 1987) is an Indian civil engineer and documentary photographer, known for his low-cost bridge designs for villages in [[Rajasthan]].{{cite|r1}} His photographs of rural infrastructure during the monsoon have been exhibited in [[Jaipur]] and [[Mumbai]].{{cite|r2}}\n\nSingh has led more than forty community construction projects and mentors young engineers through a volunteer programme he co-founded in 2016.",
  sections: [
    {
      id: 'd1',
      heading: 'Early life and education',
      level: 2,
      content:
        "Singh was born in [[Jaipur]] to a family of schoolteachers. He studied civil engineering at [[IIT Delhi]], graduating in 2009, and later completed a master's degree in structural design.{{cite|r1}}",
    },
    {
      id: 'd2',
      heading: 'Career',
      level: 2,
      content: 'After graduating, Singh joined a state infrastructure agency, where he worked on rural road and bridge projects.',
    },
  ],
  references: [
    { id: 'r1', type: 'news', title: 'The engineer building bridges', url: 'https://example.com/a', author: 'P. Sharma', publisher: 'The Daily Example', date: '2023-06-12', accessDate: '2026-10-15' },
    { id: 'r2', type: 'web', title: 'Monsoon, in pictures', url: 'https://example.com/b', author: '', publisher: 'Example Gallery', date: '2024', accessDate: '2026-10-15' },
  ],
  seeAlso: [],
  externalLinks: [],
  categories: ['Living people', '1987 births', 'Indian civil engineers'],
};

export const demoLinkStatus = { 'iit-delhi': true, rajasthan: true, jaipur: true, mumbai: false };
