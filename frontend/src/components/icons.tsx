import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const BaseIcon = ({ children, size = 24, width, height, ...props }: IconProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    width={width ?? size}
    height={height ?? size}
    {...props}
  >
    {children}
  </svg>
);

export const Copy = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </BaseIcon>
);

export const X = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </BaseIcon>
);

export const Filter = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M4 4h16" />
    <path d="M7 12h10" />
    <path d="M10 20h4" />
  </BaseIcon>
);

export const Trash2 = (props: IconProps) => (
  <BaseIcon {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </BaseIcon>
);

export const Plus = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </BaseIcon>
);

export const Minus = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M5 12h14" />
  </BaseIcon>
);

export const ShoppingBag = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </BaseIcon>
);

export const ShoppingCart = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L21 6H6" />
  </BaseIcon>
);

export const Facebook = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </BaseIcon>
);

export const Instagram = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </BaseIcon>
);

export const Twitter = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 8v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </BaseIcon>
);

export const Youtube = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58" />
    <path d="m10 15 5-3-5-3z" />
  </BaseIcon>
);

export const MapPin = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </BaseIcon>
);

export const Phone = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 9.81 19.79 19.79 0 0 1 .08 1.86 2 2 0 0 1 2.05 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6 8a16 16 0 0 0 10 10l1.36-1.36a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2.03z" />
  </BaseIcon>
);

export const Mail = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </BaseIcon>
);

export const Send = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9l20-7Z" />
  </BaseIcon>
);

export const Sparkles = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="M5.6 5.6 8 8" />
    <path d="M16 16l2.4 2.4" />
    <path d="m5.6 18.4 2.4-2.4" />
    <path d="M16 8l2.4-2.4" />
    <circle cx="12" cy="12" r="2" />
  </BaseIcon>
);

export const User = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </BaseIcon>
);

export const Loader2 = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </BaseIcon>
);

export const Shirt = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M15 3h-6l-2 3 5 4 5-4-2-3z" />
    <path d="M10 12v9" />
    <path d="M14 12v9" />
    <path d="M3 6l2 2v13" />
    <path d="M21 6l-2 2v13" />
  </BaseIcon>
);

export const Search = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </BaseIcon>
);

export const Menu = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </BaseIcon>
);

export const ChevronRight = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m9 18 6-6-6-6" />
  </BaseIcon>
);

export const ChevronLeft = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m15 18-6-6 6-6" />
  </BaseIcon>
);

export const CheckCircle2 = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </BaseIcon>
);

export const ShieldCheck = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </BaseIcon>
);

export const Lock = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 1 1 8 0v3" />
  </BaseIcon>
);

export const AlertTriangle = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </BaseIcon>
);

export const LogIn = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </BaseIcon>
);

export const Home = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M3 9l9-7 9 7" />
    <path d="M9 22V12h6v10" />
    <path d="M3 9v13h6" />
    <path d="M21 9v13h-6" />
  </BaseIcon>
);

export const LayoutGrid = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </BaseIcon>
);

export const LayoutDashboard = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="11" width="7" height="10" rx="1" />
    <rect x="3" y="12" width="7" height="9" rx="1" />
  </BaseIcon>
);

export const Package = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21 16V8a2 2 0 0 0-1.05-1.76l-7-3.5a2 2 0 0 0-1.9 0l-7 3.5A2 2 0 0 0 3 8v8a2 2 0 0 0 1.05 1.76l7 3.5a2 2 0 0 0 1.9 0l7-3.5A2 2 0 0 0 21 16Z" />
    <path d="M3.3 7.3 12 12l8.7-4.7" />
    <path d="M12 22V12" />
  </BaseIcon>
);

export const Users = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="9" cy="7" r="4" />
    <path d="M17 11a4 4 0 1 0-3-6.87" />
    <path d="M3 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
    <path d="M16 19a5 5 0 0 1 5 5v0" />
  </BaseIcon>
);

export const LogOut = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </BaseIcon>
);

export const Pencil = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </BaseIcon>
);

export const Save = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </BaseIcon>
);

export const ArrowLeft = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </BaseIcon>
);

export const TrendingUp = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M3 17 9 11l4 4 7-7" />
    <path d="M14 7h7v7" />
  </BaseIcon>
);

export const Boxes = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M9.5 4.8 16 8 9.5 11.2 3 8Z" />
    <path d="M3 14.8 9.5 18l6.5-3.2" />
    <path d="M16 8v6l6-3V5Z" />
    <path d="M9.5 11.2v6.3" />
  </BaseIcon>
);

export const Upload = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </BaseIcon>
);

export const Eye = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

export const ArrowRight = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </BaseIcon>
);

export const UserPlus = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </BaseIcon>
);

export const Info = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </BaseIcon>
);

export const Heart = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </BaseIcon>
);

export const MoreHorizontal = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </BaseIcon>
);

export const Archive = (props: IconProps) => (
  <BaseIcon {...props}>
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </BaseIcon>
);

export const RefreshCw = (props: IconProps) => (
  <BaseIcon {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </BaseIcon>
);
export const Truck = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </BaseIcon>
);

export const RotateCcw = (props: IconProps) => (
  <BaseIcon {...props}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </BaseIcon>
);

export default {
  // ... existing exports ...
  X,
  Filter,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShoppingCart,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Send,
  Sparkles,
  User,
  Loader2,
  Shirt,
  Search,
  Menu,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Lock,
  AlertTriangle,
  LogIn,
  Home,
  LayoutGrid,
  Eye,
  ArrowRight,
  UserPlus,
  Info,
  Heart,
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  Pencil,
  Save,
  ArrowLeft,
  TrendingUp,
  Boxes,
  Upload,
  MoreHorizontal,
  Archive,
  RefreshCw,
  Truck,
  RotateCcw,
};
