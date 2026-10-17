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
    name: 'SUBSTITUIR',
    description: 'SUBSTITUIR',
    image: '/logo.png',
    link: 'https://github.com/pedrosiqueiragomes19-source',
  },
  {
    name: 'SUBSTITUIR',
    description: 'SUBSTITUIR',
    image: '/logo.png',
    link: 'https://github.com/pedrosiqueiragomes19-source',
  },
];
