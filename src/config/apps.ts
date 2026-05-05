export type MuelLandingItem = {
  slug: string;
  name: string;
  label: string;
  href: string;
};

export const landingTerms = [
  { slug: "muel", name: "Muel", label: "Bot", href: "#muel" },
  { slug: "gomdori", name: "Gomdori", label: "Game", href: "#gomdori" },
  { slug: "weave", name: "Weave", label: "App", href: "#weave" },
  { slug: "server", name: "Server", label: "Discord", href: "#server" },
] satisfies MuelLandingItem[];
