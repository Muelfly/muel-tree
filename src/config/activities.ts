export type MuelActivity = {
  slug: string;
  name: string;
  route: string;
  serviceSlug: string;
  description: string;
};

export const activities: MuelActivity[] = [
  {
    slug: "weave",
    name: "일기",
    route: "/weave",
    serviceSlug: "weave",
    description: "꿈을 기록하고 연결하는 인터랙티브 앱",
  },
];

export function getActivity(slug: string): MuelActivity | undefined {
  return activities.find((a) => a.slug === slug);
}
