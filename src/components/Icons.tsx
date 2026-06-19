import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function Icon({ children, className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img className={`${className} rounded-xl object-cover`} src="/example.png" alt="" aria-hidden="true" />
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Icon>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </Icon>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </Icon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2 9.2 8.2 3 11l6.2 2.8L12 20l2.8-6.2L21 11l-6.2-2.8z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </Icon>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M5 5H3v2a4 4 0 0 0 4 4" />
      <path d="M19 5h2v2a4 4 0 0 1-4 4" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </Icon>
  );
}

export function VerifiedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true">
      <path d="M449.530286 577.163429l290.102857-289.022858c9.389714-9.355429 24.585143-9.325714 33.940571 0.062858 9.355429 9.390857 9.325714 24.586286-0.062857 33.941714L466.684571 627.828571l-0.030857 0.030858c-9.317714 9.282286-24.350857 9.325714-33.722285 0.153142L252.390857 452.043429c-9.491429-9.251429-9.686857-24.445714-0.434286-33.938286 9.251429-9.491429 24.445714-9.686857 33.938286-0.434286l163.634286 159.492572z m511.515428-65.278858c0.037714 0.726857 0.042286 1.461714 0.013715 2.202286-2.094857 53.195429-11.216 100.028571-27.513143 140.445714-0.954286 2.365714-5.717714 14.504-7.205715 18.213715-3.451429 8.603429-6.693714 16.270857-10.288 24.179428-9.486857 20.873143-20.395429 41.022857-33.851428 61.557715-35.042286 53.482286-83.862857 104.043429-150.857143 151.296-57.744 40.728-127.466286 77.768-210.524571 110.561142a23.938286 23.938286 0 0 1-8.758858 1.683429 23.933714 23.933714 0 0 1-8.945142-1.682286c-83.058286-32.793143-152.780571-69.834286-210.525715-110.562285-66.994286-47.251429-115.813714-97.813714-150.857143-151.294858-13.454857-20.534857-24.363429-40.685714-33.851428-61.558857-3.593143-7.908571-6.835429-15.574857-10.285714-24.179428-1.489143-3.709714-6.251429-15.846857-7.206858-18.212572-16.251429-40.304-25.366857-86.987429-27.494857-139.998857a24.075429 24.075429 0 0 1-0.608-5.392v-400c0-3.019429 0.557714-5.908571 1.576-8.571428 1.822857-9.385143 9.193143-17.158857 19.161143-19.020572L488.297143 5.876571a129.142857 129.142857 0 0 1 47.408 0l405.273143 75.674286c11.318857 2.114286 19.288 11.851429 19.589714 22.913143 0.377143 1.690286 0.576 3.446857 0.576 5.250286v400c0 0.731429-0.033143 1.456-0.097143 2.171428z m-47.870857-0.912A24.393143 24.393143 0 0 1 913.142857 509.714286V125.182857L526.893714 53.062857a81.142857 81.142857 0 0 0-29.787428 0L110.285714 125.290286v382.626285c0.307429 1.384 0.496 2.816 0.553143 4.282286 1.888 47.954286 9.96 89.396571 24.067429 124.384 1.060571 2.628571 5.845714 14.822857 7.238857 18.294857 3.2 7.979429 6.170286 15.002286 9.435428 22.186286 8.514286 18.731429 18.260571 36.737143 30.301715 55.113143 31.736 48.434286 76.322286 94.611429 138.373714 138.377143 52.514286 37.04 115.992 71.100571 191.710857 101.638857 75.718857-30.538286 139.196571-64.598857 191.712-101.638857 62.051429-43.765714 106.638857-89.942857 138.373714-138.377143 12.041143-18.377143 21.788571-36.382857 30.302858-55.113143 3.265143-7.184 6.234286-14.206857 9.434285-22.186286 1.394286-3.474286 6.179429-15.666286 7.238857-18.294857 14.107429-34.987429 22.179429-76.430857 24.068572-124.384 0.014857-0.411429 0.041143-0.820571 0.077714-1.226286z" />
    </svg>
  );
}
