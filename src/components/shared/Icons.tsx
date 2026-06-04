"use client"

import { SVGProps } from "react"

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function Icon({
  children,
  size = 19,
  fill,
  stroke = "currentColor",
  strokeWidth: sw = 1.6,
  style,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill || "none"}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      {...rest}
    >
      {children}
    </svg>
  )
}

export function GridIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Icon>
  )
}

export function UploadIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M12 3v13" />
      <path d="M7 8l5-5 5 5" />
    </Icon>
  )
}

export function LayoutIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </Icon>
  )
}

export function WalletIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" />
      <path d="M21 11h-5a2 2 0 0 0 0 4h5z" />
    </Icon>
  )
}

export function LockIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <rect x="4.5" y="11" width="15" height="9" rx="1.6" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
  )
}

export function ClockIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.2l2.8 1.8" />
    </Icon>
  )
}

export function ShieldIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
    </Icon>
  )
}

export function SkullIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M12 3a8 8 0 0 0-8 8c0 2.8 1.4 4.6 3 5.6V19a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 19v-2.4c1.6-1 3-2.8 3-5.6a8 8 0 0 0-8-8z" />
      <circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.4" fill="currentColor" stroke="none" />
      <path d="M12 15v2" />
    </Icon>
  )
}

export function ExternalIcon(p: IconProps) {
  return (
    <Icon size={14} {...p}>
      <path d="M14 5h5v5" />
      <path d="M19 5l-7 7" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </Icon>
  )
}

export function PauseIcon(p: IconProps) {
  return (
    <Icon size={15} {...p}>
      <rect x="7" y="5" width="3.2" height="14" rx="1" />
      <rect x="13.8" y="5" width="3.2" height="14" rx="1" />
    </Icon>
  )
}

export function RenewIcon(p: IconProps) {
  return (
    <Icon size={15} {...p}>
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 20v-4h4" />
    </Icon>
  )
}

export function TrashIcon(p: IconProps) {
  return (
    <Icon size={15} {...p}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </Icon>
  )
}

export function SearchIcon(p: IconProps) {
  return (
    <Icon size={15} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Icon>
  )
}

export function ChevronIcon(p: IconProps) {
  return (
    <Icon size={14} {...p}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  )
}

export function CheckIcon(p: IconProps) {
  return (
    <Icon size={14} strokeWidth={2.2} {...p}>
      <path d="M4 12l5 5L20 6" />
    </Icon>
  )
}

export function DatabaseIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      <path d="M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </Icon>
  )
}

export function ArrowIcon(p: IconProps) {
  return (
    <Icon size={15} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  )
}

export function PlusIcon(p: IconProps) {
  return (
    <Icon size={15} {...p}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}

export function FileIcon(p: IconProps) {
  return (
    <Icon {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </Icon>
  )
}

export function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

export function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function BackArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

export function CTAArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export const CONDITION_ICON_MAP: Record<string, React.FC<IconProps>> = {
  Lock: LockIcon,
  Clock: ClockIcon,
  Shield: ShieldIcon,
  Skull: SkullIcon,
}
