import { NewsProvider } from "@/contexts/news-context";

export default function NoticiasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NewsProvider>{children}</NewsProvider>;
}
