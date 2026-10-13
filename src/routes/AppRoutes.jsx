import { Layout, Menu, Tag, Tooltip } from 'antd';
import {
  HomeOutlined,
  UnorderedListOutlined,
  CloudServerOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
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

  const {
    movies,
    isLoading: isMoviesLoading,
    source: moviesSource,
  } = useMovies();

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

  const isBackend = moviesSource === 'backend';

  return (
    <Layout className="app-layout">
      <Header />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Menu
          className="app-menu"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, justifyContent: 'center' }}
        />

        <div
          style={{
            position: 'absolute',
            right: 24,
            zIndex: 10,
          }}
        >
          <Tooltip
            title={
              isBackend
                ? 'Connected to Quarkus backend (Avati)'
                : 'Quarkus backend offline — running on movies.json fallback'
            }
          >
            <Tag
              icon={isBackend ? <CloudServerOutlined /> : <FileTextOutlined />}
              color={isBackend ? 'green' : 'orange'}
              style={{ cursor: 'pointer' }}
            >
              {isBackend ? 'Quarkus Backend' : 'Local Fallback'}
            </Tag>
          </Tooltip>
        </div>
      </div>

      <Content className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <MoviesGrid
                movies={movies}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
                loading={isMoviesLoading}
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
