
import {
  ConfigProvider,
  App as AntApp,
} from 'antd';
import { SWRConfig } from 'swr';
import { swrConfig } from './swrConfig';

export default function AppProviders({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#e50914',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <SWRConfig value={swrConfig}>
          {children}
        </SWRConfig>
      </AntApp>
    </ConfigProvider>
  );
}
