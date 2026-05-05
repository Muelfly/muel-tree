export type MuelProduct = {
  slug: string;
  name: string;
  kind: "Bot" | "Activity" | "Game" | "Channel";
  status: "main" | "live" | "planned" | "channel";
  route: string;
  description: string;
  cta: string;
};

export const platformTerms = {
  platform: "Muel Platform",
  webApp: "Muel Web App",
  bot: "Muel Discord Bot",
  hub: "Hub",
  activity: "Activity",
  miniApp: "Mini App",
  product: "Product",
} as const;

export const muelProducts: MuelProduct[] = [
  {
    slug: "muel",
    name: "Muel",
    kind: "Bot",
    status: "main",
    route: "#muel",
    description: "고닥 커뮤니티를 위한 Discord 챗봇입니다.",
    cta: "챗봇 소개",
  },
  {
    slug: "black-or-white",
    name: "Black or White",
    kind: "Game",
    status: "planned",
    route: "#black-or-white",
    description: "사람을 모아 바로 시작하는 추리 게임입니다.",
    cta: "준비 중",
  },
  {
    slug: "weave",
    name: "세계수",
    kind: "Activity",
    status: "live",
    route: "/weave",
    description: "꿈 기록을 3D 네트워크로 엮어 보는 서브 Activity입니다.",
    cta: "체험하기",
  },
  {
    slug: "premium-blog",
    name: "Premium Blog",
    kind: "Channel",
    status: "channel",
    route: "#premium-blog",
    description: "네이버 프리미엄 콘텐츠를 활용하는 외부 채널입니다.",
    cta: "소식 보기",
  },
];
