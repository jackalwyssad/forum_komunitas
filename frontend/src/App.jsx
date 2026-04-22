import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import ThreadsPage from "./pages/ThreadsPage";
import ThreadDetailPage from "./pages/ThreadDetailPage";
import CreateThreadPage from "./pages/CreateThreadPage";
import CategoriesPage from "./pages/CategoriesPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app">
            <Navbar />
            <main className="app-main">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/forum" element={<ThreadsPage />} />
                <Route path="/threads/:id" element={<ThreadDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Routes */}
                <Route
                  path="/threads/create"
                  element={
                    <ProtectedRoute>
                      <CreateThreadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Routes */}
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminCategoriesPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
