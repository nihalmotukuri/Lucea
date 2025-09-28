import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom'
import Navbar from "./components/layout/Navbar"
import Home from './pages/home/Home'
import Search from './pages/search/Search'
import Explore from './pages/explore/Explore'
import CollectionDetailPage from './pages/explore/CollectionDetailPage'
import PhotoDetailModal from './components/media/PhotoDetailModal'
import PhotoDetailPage from './pages/media-detail/PhotoDetailPage'
import { ScrollToTop } from './components/features/ScrollToTop'
import VideoDetailPage from './pages/media-detail/VideoDetailPage'
import VideoDetailModal from './components/media/VideoDetailModal'

function App() {
  const location = useLocation()
  const state = location.state

  return (
    <>
      <Navbar />

      <main className='h-screen pl-[80px]'>
        <Routes location={state?.photoBackgroundLocation || location}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/t/:topicSlug" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:collectionId" element={<CollectionDetailPage />} />
          <Route path="/photos/:photoId" element={<PhotoDetailPage />} />
          <Route path="/videos/:videoId" element={<VideoDetailPage />} />
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
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  )
}
