export type ServiceStatus = "live" | "beta" | "planned";

export type MuelService = {
  slug: "muel" | "gomdori" | "weave" | "server";
  name: string;
  label: string;
  href: string;
  route: string | null;
  status: ServiceStatus;
  statusLabel: string;
  operatingModel: string;
  description: string;
  sectionClassName: string;
  badgeLight?: boolean;
  primaryAction: {
    label: string;
    href: string | null;
  };
};

export const services = [
  {
    slug: "muel",
    name: "Muel",
    label: "Bot",
    href: "#muel",
    route: null,
    status: "planned",
    statusLabel: "준비 중",
    operatingModel: "Discord Bot + Supabase",
    description: "커뮤니티 멤버가 Discord 안에서 바로 호출하는 챗봇 서비스입니다.",
    sectionClassName:
      "bg-gradient-to-br from-[#a2e61d] to-[#ffde90] text-ink",
    badgeLight: true,
    primaryAction: { label: "초대 준비 중", href: null },
  },
  {
    slug: "gomdori",
    name: "Gomdori",
    label: "Game",
    href: "#gomdori",
    route: null,
    status: "planned",
    statusLabel: "기획 중",
    operatingModel: "Discord <-> Toss",
    description: "인플루언서와 커뮤니티 멤버가 함께 시작하는 추리 게임 경험입니다.",
    sectionClassName: "bg-[#0a0a0a] text-white",
    primaryAction: { label: "준비 중", href: null },
  },
  {
    slug: "weave",
    name: "Weave",
    label: "App",
    href: "#weave",
    route: "/weave",
    status: "beta",
    statusLabel: "베타",
    operatingModel: "Discord <-> Toss",
    description: "공동 경험과 기록을 꿈 네트워크로 연결하는 인터랙티브 앱입니다.",
    sectionClassName:
      "bg-gradient-to-br from-[#5B21B6] to-[#DB2777] text-white",
    primaryAction: { label: "체험하기", href: "/weave" },
  },
  {
    slug: "server",
    name: "Server",
    label: "Discord",
    href: "#server",
    route: null,
    status: "live",
    statusLabel: "운영 중",
    operatingModel: "Discord Server + Supabase",
    description: "유저에게는 Discord Server로 보이고, 운영 데이터는 Supabase로 모입니다.",
    sectionClassName: "bg-[#1e2433] text-white",
    primaryAction: { label: "참여하기", href: "https://discord.gg/NdBHcbXpjh" },
  },
] satisfies MuelService[];

export const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Team", href: "#team" },
  ...services.map(({ name, href }) => ({ label: name, href })),
  { label: "Store", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Support", href: "#" },
];

export const teamUpdates = [
  {
    date: "2025년 5월",
    category: "Muel",
    text: "Muel 챗봇 소개 준비 중",
    href: "#muel",
  },
  {
    date: "2025년 4월",
    category: "Gomdori",
    text: "Gomdori 기획 중",
    href: "#gomdori",
  },
  {
    date: "2025년 3월",
    category: "Weave",
    text: "Weave 베타 공개",
    href: "#weave",
  },
];

export const footerLinks = [
  { label: "공식 Discord", href: "#server" },
  { label: "블로그", href: "#" },
];
