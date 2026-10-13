import AppProviders from './app/AppProviders';
import AppRoutes from './routes/AppRoutes';

import './App.css';
import './styles.css';

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
