
import { uniqueId } from 'lodash';

import {
  IconCopy, IconLayoutDashboard, IconMoodHappy, IconTypography, IconFileUpload, IconCalendarEvent, IconClipboardList, IconGavel, IconUsers,
  IconAward,
  IconBoxMultiple,
  IconPoint,
  IconAlertCircle,
  IconNotes,
  IconCalendar,
  IconMail,
  IconTicket,
  IconEdit,
  IconCurrencyDollar,
  IconApps,
  IconFileDescription,
  IconFileDots,
  IconFiles,
  IconBan,
  IconStar,
  IconMoodSmile,
  IconBorderAll,
  IconBorderHorizontal,
  IconBorderInner,
  IconBorderVertical,
  IconBorderTop,
  IconUserCircle,
  IconPackage,
  IconMessage2,
  IconBasket,
  IconChartLine,
  IconChartArcs,
  IconChartCandle,
  IconChartArea,
  IconChartDots,
  IconChartDonut3,
  IconChartRadar,
  IconLogin,
  IconUserPlus,
  IconRotate,
  IconBox,
  IconShoppingCart,
  IconAperture,
  IconLayout,
  IconSettings,
  IconHelp,
  IconZoomCode,
  IconBoxAlignBottom,
  IconBoxAlignLeft,
  IconBorderStyle2,
  IconAppWindow,
  IconNotebook,
  IconFileCheck,
  IconChartHistogram,
  IconChartPie2,
  IconChartScatter,
  IconChartPpf,
  IconChartArcs3,
  IconListTree,
  IconLayoutSidebar,
  IconLock, IconAlignBoxLeftBottom, IconCheckbox, IconRadar, IconSlideshow, IconCaretUpDown, IconTable, IconForms
} from '@tabler/icons-react';

// Roles: USER, ADMIN
// USER: Dashboard, Pautas, Audiências
// ADMIN: Todas as rotas

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
    roles: ['USER', 'ADMIN'],
    disabled: true,
  },
  {
    id: uniqueId(),
    title: 'Upload Planilha',
    icon: IconFileUpload,
    href: '/upload-planilha',
    roles: ['ADMIN'],
  },
  {
    id: uniqueId(),
    title: 'Equipe',
    icon: IconUsers,
    roles: ['ADMIN'],
    children: [
      {
        id: uniqueId(),
        title: 'Avaliadores',
        href: '/equipe/avaliadores',
        roles: ['ADMIN'],
      },
      {
        id: uniqueId(),
        title: 'Pautistas',
        href: '/equipe/pautistas',
        roles: ['ADMIN'],
        disabled: true,
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Escala',
    icon: IconCalendarEvent,
    roles: ['ADMIN'],
    children: [
       {
        id: uniqueId(),
        title: 'Escalar Avaliador',
        href: '/escala/avaliador',
        roles: ['ADMIN'],
      },
      {
        id: uniqueId(),
        title: 'Escalar Pautista',
        href: '/escala/pautista',
        roles: ['ADMIN'],
        disabled: true,
      }
    ],
  },
  {
    id: uniqueId(),
    title: 'Pautas',
    icon: IconClipboardList,
    href: '/pautas',
    roles: ['USER', 'ADMIN'],
  },
  {
    id: uniqueId(),
    title: 'Audiências',
    icon: IconGavel,
    href: '/audiencias',
    roles: ['USER', 'ADMIN'],
  }
  ,
  {
    id: uniqueId(),
    title: 'Advogados Prioritarios',
    icon: IconUserPlus,
    href: '/advogados-prioritarios',
    roles: ['ADMIN'],
  }
];

export default Menuitems;
