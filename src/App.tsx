/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import EditPage from './pages/EditPage';
import ViewPage from './pages/ViewPage';
import { isConfigValid } from './lib/firebase';
import FirebaseSetupGuide from './components/FirebaseSetupGuide';

export default function App() {
  if (!isConfigValid) {
    return <FirebaseSetupGuide />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          { /* Public Landing Page */ }
          <Route path="/" element={<LandingPage />} />
          
          { /* Public Viewers (existing logic relies on queries like /view?id=...) */ }
          <Route path="/view" element={<ViewPage />} />
          <Route path="/share/:id" element={<ViewPage />} />
          <Route path="/print/:id" element={<ViewPage />} />

          { /* Protected Editor Routes */ }
          <Route element={<ProtectedRoute />}>
             <Route path="/app" element={<EditPage />} />
             <Route path="/edit" element={<Navigate to="/app" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
