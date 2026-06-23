import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HR Prism — 진단이라는 프리즘으로 비춰보는 인사 운영",
  description: "감으로 판단하던 인사 운영을, 진단이라는 프리즘으로 비춰보고 회사의 인사 철학과 실제 제도, 제도 사이의 충돌까지 투명하게 확인합니다.",
  icons: {
    icon: "/hr-prism-favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
