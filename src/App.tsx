import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useParams, useNavigate } from "react-router-dom";


// Components
import { Skeleton } from "@/components/ui/skeleton";


// Lazy load pages
const Index = lazy(() => import("@/pages/Index"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Fixtures = lazy(() => import("@/pages/Fixtures"));
const Standings = lazy(() => import("@/pages/Standings"));
const LeagueDetailsPage = lazy(() => import("@/pages/LeagueDetailsPage"));
const MatchDetails = lazy(() => import("@/components/MatchDetails"));
const CountryDetailsPage = lazy(() => import("@/pages/CountryDetailsPage"));
const PlayerDetailsPage = lazy(() => import("@/pages/PlayerDetailsPage"));
const NewsPage = lazy(() => import("@/pages/NewsPage"));
const TermsOfUse = lazy(() => import("@/pages/static/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("@/pages/static/PrivacyPolicy"));
const Advertise = lazy(() => import("@/pages/static/Advertise"));
const Contact = lazy(() => import("@/pages/static/Contact"));

// Layouts
// Layouts
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { LeaguePriorityPage } from "@/pages/admin/LeaguePriority";
import { PostEditor } from "@/pages/admin/PostEditor";
import { ArticlePage } from "@/pages/ArticlePage";
import { LoginPage } from "@/pages/admin/LoginPage";
import { FooterLinksPage } from "@/pages/admin/FooterLinks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry rate limit errors (429) or unauthorized (401)
        if (error?.response?.status === 429 || error?.response?.status === 401) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 30 * 60 * 1000, // 30 minutes - extended from 5 minutes
      gcTime: 60 * 60 * 1000, // 1 hour garbage collection time
    },
  },
});

const MatchDetailsWrapper = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  if (!matchId) {
    return <div>No match ID provided</div>;
  }

  return <MatchDetails matchId={matchId} onBack={() => navigate(-1)} />;
};
import InstallPrompt from "@/components/InstallPrompt";
import ScrollToTop from "@/components/ScrollToTop";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InstallPrompt />
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>

              {/* Admin Routes - No MainLayout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="league-priorities" element={<LeaguePriorityPage />} />
                <Route path="posts/new" element={<PostEditor />} />
                <Route path="posts/edit/:id" element={<PostEditor />} />
                <Route path="footer-links" element={<FooterLinksPage />} />
              </Route>
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Public Routes - Wrapped in MainLayout */}
              <Route path="*" element={
                <MainLayout>
                  <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center min-h-screen">
                      <div className="animate-pulse">Loading...</div>
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/leagues/:country/:leagueName" element={<LeagueDetailsPage />} />
                      <Route path="/standings/:leagueId" element={<Standings />} />
                      <Route path="/country/:countryName" element={<CountryDetailsPage />} />
                      {/* Support both old ID-only URLs and new SEO-friendly URLs */}
                      <Route path="/match/:matchId" element={<MatchDetailsWrapper />} />
                      <Route path="/match/:slug/:matchId" element={<MatchDetailsWrapper />} />
                      <Route path="/player/:playerId" element={<PlayerDetailsPage />} />
                      <Route path="/news" element={<NewsPage />} />
                      <Route path="/news/:slug" element={<ArticlePage />} />

                      {/* Static Pages */}
                      <Route path="/terms" element={<TermsOfUse />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/advertise" element={<Advertise />} />
                      <Route path="/contact" element={<Contact />} />

                      <Route path="/not-found" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/not-found" replace />} />
                    </Routes>
                  </Suspense>
                </MainLayout>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;


