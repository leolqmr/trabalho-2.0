import { type SidebarData } from '@cincoders/cinnamon';
import { CalendarCheck, GraduationCap, Users } from 'lucide-react';
import { Links } from './enums';
import cincodersLogo from '../assets/icons/logo_cincoders-icon.svg';

/**
 * Conteúdo da sidebar (Drawer aberto pelo botão de menu do Navbar).
 * `navMain` fica sempre visível; `navGroups` são seções colapsáveis.
 */
export const sidebar: SidebarData = {
  appName: 'Controle de Frequência',
  // Import de módulo (não um caminho em public/): o bundler resolve a URL
  // final já considerando o base configurado (VITE_BASE_URL), do mesmo
  // jeito que `cin-logo.svg` em pages/login.
  appLogoSrc: cincodersLogo,
  navMain: [
    {
      id: 'turmas',
      title: 'Turmas',
      href: Links.TURMAS,
      IconComponent: GraduationCap,
    },
    {
      id: 'minha-frequencia',
      title: 'Minha Frequência',
      href: Links.MINHA_FREQUENCIA,
      IconComponent: CalendarCheck,
    },
    {
      // Só ADMIN vê este item: `Links.TEAM` está em `ADMIN_ONLY_LINKS` e o
      // `PageCin` filtra o menu por isso. A rota em si também exige a role.
      id: 'team',
      title: 'Gerenciar Equipe',
      href: Links.TEAM,
      IconComponent: Users,
    },
  ],
};
