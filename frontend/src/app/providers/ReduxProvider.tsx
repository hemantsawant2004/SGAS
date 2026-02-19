import { Provider } from 'react-redux';
import {persistor, store } from '../store';
import { PersistGate } from 'redux-persist/lib/integration/react';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
  <Provider store={store}>
    <PersistGate
      loading={
          <div className="min-h-screen grid place-items-center">
            <p className="text-sm text-gray-500">Loading session…</p>
          </div>
        }
        persistor={persistor}>
    {children}
    </PersistGate>
  </Provider>
)
}
