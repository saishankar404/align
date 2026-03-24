import HomeApp from "@/components/home/HomeApp";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

export default function HomePage() {
  return (
    <main className="h-full w-full overflow-hidden">
      <ErrorBoundary>
        <HomeApp />
      </ErrorBoundary>
    </main>
  );
}
