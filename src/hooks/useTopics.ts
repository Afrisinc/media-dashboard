import { useQuery } from "@tanstack/react-query";

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const TOPICS: Topic[] = [
  {
    id: "innovation",
    name: "Innovation",
    description: "Innovation and emerging technologies",
    created_at: new Date().toISOString(),
  },
  {
    id: "automation",
    name: "Automation",
    description: "Automation and process optimization",
    created_at: new Date().toISOString(),
  },
  {
    id: "ai_data",
    name: "AI & Data Science",
    description: "Artificial Intelligence and Data Science",
    created_at: new Date().toISOString(),
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Productivity tools and tips",
    created_at: new Date().toISOString(),
  },
  {
    id: "business",
    name: "Business",
    description: "Business insights and strategies",
    created_at: new Date().toISOString(),
  },
  {
    id: "tools",
    name: "Tools & Software",
    description: "Tools and software recommendations",
    created_at: new Date().toISOString(),
  },
  {
    id: "insights",
    name: "Insights",
    description: "Industry insights and analysis",
    created_at: new Date().toISOString(),
  },
];

export const useTopics = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => TOPICS,
  });
};
