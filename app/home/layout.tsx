import AuthGuard from "@/components/auth/AuthGuard";
import HomeProviders from "@/components/home/HomeProviders";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <HomeProviders>{children}</HomeProviders>
    </AuthGuard>
  );
}
