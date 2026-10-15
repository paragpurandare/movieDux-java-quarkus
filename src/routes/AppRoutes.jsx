import { Layout, Menu } from 'antd';
import { HomeOutlined, UnorderedListOutlined } from '@ant-design/icons';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MoviesGrid from '../components/MoviesGrid';
import Watchlist from '../components/Watchlist';

import useMovies from '../hooks/useMovies';
import useMovieMutations from '../hooks/useMovieMutations';
import useWatchlist from '../hooks/useWatchlist';
import useWatchlistMutations from '../hooks/useWatchlistMutations';

const { Content } = Layout;

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Full catalog for Watchlist route
  const { movies } = useMovies();

  const {
    createMovie,
    updateMovie,
    deleteMovie,
    isMutating: isMovieMutating,
  } = useMovieMutations();

  const {
    watchlist,
    isLoading: isWatchlistLoading,
  } = useWatchlist();

  const { toggleWatchlist } = useWatchlistMutations();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: '/watchlist',
      icon: <UnorderedListOutlined />,
      label: 'Watchlist',
    },
  ];

  return (
    <Layout className="app-layout">
      <Header />

      <Menu
        className="app-menu"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />

      <Content className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <MoviesGrid
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
                onCreateMovie={createMovie}
                onUpdateMovie={updateMovie}
                onDeleteMovie={deleteMovie}
                isMutating={isMovieMutating}
              />
            }
          />

          <Route
            path="/watchlist"
            element={
              <Watchlist
                movies={movies}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
                loading={isWatchlistLoading}
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>

      <Footer />
    </Layout>
  );
}

export default function AppRoutes() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
