import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faWrench,
  faExclamationTriangle,
  faChartBar,
  faClipboard,
  faMapMarkerAlt,
  faCalendar,
  faBuilding,
  faUser,
  faFileAlt,
  faBriefcase,
  faDoorOpen,
  faCheck,
  faTimes,
  faClock,
  faSearch,
  faChartLine,
  faFile,
  faSave,
  faTrash,
  faEdit,
  faEye,
  faPlus,
  faHome,
  faSignOutAlt,
  faFilter,
  faInbox,
  faBoxes,
  faCheckCircle,
  faTimesCircle,
  faClipboardList,
  faTasks,
  faToolbox,
  faUsers,
  faArrowRight,
  faArrowLeft,
  faDownload,
  faUpload,
  faExchangeAlt,
  faThumbtack,
  faTag,
  faFolder,
  faTags,
  faDollarSign,
  faPlay,
  faBan,
  faSitemap,
} from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

// Mapeo de nombres de iconos a iconos de Font Awesome
const iconMap: Record<string, IconProp> = {
  box: faBox,
  wrench: faWrench,
  warning: faExclamationTriangle,
  'chart-bar': faChartBar,
  clipboard: faClipboard,
  'map-marker': faMapMarkerAlt,
  calendar: faCalendar,
  building: faBuilding,
  user: faUser,
  users: faUsers,
  file: faFileAlt,
  'file-alt': faFileAlt,
  briefcase: faBriefcase,
  door: faDoorOpen,
  check: faCheck,
  'check-circle': faCheckCircle,
  times: faTimes,
  'times-circle': faTimesCircle,
  clock: faClock,
  search: faSearch,
  'chart-line': faChartLine,
  save: faSave,
  trash: faTrash,
  edit: faEdit,
  eye: faEye,
  plus: faPlus,
  home: faHome,
  'sign-out': faSignOutAlt,
  filter: faFilter,
  inbox: faInbox,
  boxes: faBoxes,
  'clipboard-list': faClipboardList,
  tasks: faTasks,
  toolbox: faToolbox,
  'arrow-right': faArrowRight,
  'arrow-left': faArrowLeft,
  download: faDownload,
  upload: faUpload,
  exchange: faExchangeAlt,
  thumbtack: faThumbtack,
  tag: faTag,
  tags: faTags,
  folder: faFolder,
  'dollar-sign': faDollarSign,
  play: faPlay,
  ban: faBan,
  sitemap: faSitemap,
};

interface IconProps {
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x';
  fixedWidth?: boolean;
  spin?: boolean;
}

export default function Icon({ name, className = '', size, fixedWidth = false, spin = false }: IconProps) {
  const icon = iconMap[name] || faBox;
  
  return (
    <FontAwesomeIcon 
      icon={icon} 
      className={className}
      size={size}
      fixedWidth={fixedWidth}
      spin={spin}
    />
  );
}
