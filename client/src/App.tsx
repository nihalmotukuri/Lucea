import { lazy, Suspense } from "react"
import { Routes, Route, BrowserRouter, Navigate, useLocation, Link } from 'react-router-dom'
import Navbar from "./components/layout/Navbar"
import Home from './pages/home/Home'
import Search from './pages/search/Search'
import PhotoDetailModal from './components/media/PhotoDetailModal'
import PhotoDetailPage from './pages/media-detail/PhotoDetailPage'
import { ScrollToTop } from './components/features/ScrollToTop'
import VideoDetailPage from './pages/media-detail/VideoDetailPage'
import VideoDetailModal from './components/media/VideoDetailModal'
import MoodboardsPage from './pages/moodboards/MoodboardsPage'
import AuthProvider from './auth/AuthProvider'
import AuthCallback from './auth/AuthCallback'
import { fullScreenLoadingClass } from "./components/features/LoadingIndicator"

const MyProfilePage = lazy(() => import("./pages/profiles/PublicProfiles").then(module => ({ default: module.MyProfilePage })))
const PublicMoodboardPage = lazy(() => import("./pages/profiles/PublicProfiles").then(module => ({ default: module.PublicMoodboardPage })))
const PublicProfilePage = lazy(() => import("./pages/profiles/PublicProfiles").then(module => ({ default: module.PublicProfilePage })))

function NotFound() {
  return (
    <section className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">404 / Lost in the field</p>
      <h1 className="mt-3 font-editorial text-3xl text-neutral-800">This page isn’t here.</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        The link may be out of date, or the page may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-10 items-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
      >
        Back to explore
      </Link>
    </section>
  )
}

function App() {
  const location = useLocation()
  const state = location.state

  return (
    <>
      <Navbar />

      <main className='min-h-screen pb-[76px] md:h-screen md:pb-0 md:pl-[80px]'>
        <Routes location={state?.photoBackgroundLocation || state?.videoBackgroundLocation || location}>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/t/:topicSlug" element={<Home />} />
          <Route path="/explore/*" element={<Navigate to="/" replace />} />
          <Route path="/moodboards" element={<MoodboardsPage />} />
          <Route path="/moodboards/:moodboardId" element={<MoodboardsPage />} />
          <Route path="/profile" element={<Suspense fallback={<div aria-hidden="true" className={fullScreenLoadingClass} />}><MyProfilePage /></Suspense>} />
          <Route path="/profiles/:handle/boards/:moodboardId" element={<Suspense fallback={<div aria-hidden="true" className={fullScreenLoadingClass} />}><PublicMoodboardPage /></Suspense>} />
          <Route path="/profiles/:handle" element={<Suspense fallback={<div aria-hidden="true" className={fullScreenLoadingClass} />}><PublicProfilePage /></Suspense>} />
          <Route path="/photos/:photoId" element={<PhotoDetailPage />} />
          <Route path="/videos/:videoId" element={<VideoDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {state?.photoBackgroundLocation && (
          <Routes>
            <Route path="/photos/:photoId" element={<PhotoDetailModal />} />
          </Routes>
        )}

        {state?.videoBackgroundLocation && (
          <Routes>
            <Route path="/videos/:videoId" element={<VideoDetailModal />} />
          </Routes>
        )}
      </main>
    </>
  )
}

export default function Root() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </AuthProvider>
  )
}
