// Dados dos projetos em destaque no portfólio

export interface Project {
  name: string;
  description: string;
  image: string;
  link: string;
}

export const PROJECTS: Project[] = [
  {
    name: 'Portfólio Pedro Siqueira',
    description: 'Portfólio pessoal contemporâneo desenvolvido com Angular 22, TypeScript e Tailwind CSS.',
    image: '/logo.png',
    link: 'https://github.com/pedrosiqueiragomes19-source/portfolio-pedro',
  },
  {
    name: 'QuickHelp',
    description: 'QuickHelp é uma plataforma web discreta de apoio a mulheres em risco, com interface de delivery, SOS, contatos de emergência e orientações de segurança. Projeto acadêmico interdisciplinar, em grupo e em andamento.\n\nTecnologias: PHP 8.3, Laravel 13, MySQL, JavaScript, HTML, CSS, Tailwind CSS 4, Vite, Blade e Chart.js.\n\nQuickHelp is a discreet web platform supporting women in risky situations, with a delivery-app interface, SOS, emergency contacts and safety guidance. An interdisciplinary group academic project, in progress.\n\nTechnologies: PHP 8.3, Laravel 13, MySQL, JavaScript, HTML, CSS, Tailwind CSS 4, Vite, Blade, and Chart.js.',
    image: '/logo.png',
    link: 'https://quickhelp-tgd9.onrender.com/',
  },
];
