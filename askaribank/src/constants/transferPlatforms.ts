export type PlatformId =
  | 'bank'
  | 'jazzcash'
  | 'easypaisa'
  | 'nayapay'
  | 'sadapay'
  | 'upaisa';

export interface TransferPlatform {
  id: PlatformId;
  name: string;
  shortName: string;
  gradient: string;
  ring: string;
  bgLight: string;
  text: string;
  icon: string;
  accountPlaceholder: string;
  accountPattern: RegExp;
}

export const TRANSFER_PLATFORMS: TransferPlatform[] = [
  {
    id: 'bank',
    name: 'Bank Transfer',
    shortName: 'Bank',
    gradient: 'from-[#1E3A8A] to-[#2563EB]',
    ring: 'ring-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-700',
    icon: '🏦',
    accountPlaceholder: 'IBAN or account number',
    accountPattern: /^[A-Za-z0-9]{8,24}$/,
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    shortName: 'JazzCash',
    gradient: 'from-[#DC2626] to-[#EF4444]',
    ring: 'ring-red-500',
    bgLight: 'bg-red-50',
    text: 'text-red-700',
    icon: '📱',
    accountPlaceholder: '03XX XXXXXXX',
    accountPattern: /^03\d{9}$/,
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    shortName: 'EasyPaisa',
    gradient: 'from-[#15803D] to-[#22C55E]',
    ring: 'ring-green-500',
    bgLight: 'bg-green-50',
    text: 'text-green-700',
    icon: '💚',
    accountPlaceholder: '03XX XXXXXXX',
    accountPattern: /^03\d{9}$/,
  },
  {
    id: 'nayapay',
    name: 'NayaPay',
    shortName: 'NayaPay',
    gradient: 'from-[#EA580C] to-[#F97316]',
    ring: 'ring-orange-500',
    bgLight: 'bg-orange-50',
    text: 'text-orange-700',
    icon: '🟠',
    accountPlaceholder: '03XX XXXXXXX',
    accountPattern: /^03\d{9}$/,
  },
  {
    id: 'sadapay',
    name: 'SadaPay',
    shortName: 'SadaPay',
    gradient: 'from-[#7C3AED] to-[#A855F7]',
    ring: 'ring-purple-500',
    bgLight: 'bg-purple-50',
    text: 'text-purple-700',
    icon: '💜',
    accountPlaceholder: '03XX XXXXXXX',
    accountPattern: /^03\d{9}$/,
  },
  {
    id: 'upaisa',
    name: 'UPaisa',
    shortName: 'UPaisa',
    gradient: 'from-[#CA8A04] to-[#EAB308]',
    ring: 'ring-yellow-500',
    bgLight: 'bg-yellow-50',
    text: 'text-yellow-800',
    icon: '🟡',
    accountPlaceholder: '03XX XXXXXXX',
    accountPattern: /^03\d{9}$/,
  },
];

export const getPlatform = (id: PlatformId) =>
  TRANSFER_PLATFORMS.find((p) => p.id === id) || TRANSFER_PLATFORMS[0];

export const PAKISTAN_BANKS = [
  'Askari Bank',
  'HBL',
  'UBL',
  'MCB',
  'Meezan Bank',
  'Allied Bank',
  'Bank Alfalah',
  'Faysal Bank',
];
