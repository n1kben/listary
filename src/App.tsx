import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ListProvider } from "@/contexts/ListContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ListsPage } from "@/pages/ListsPage";
import { ListItemsPage } from "@/pages/ListItemsPage";
import { AuthForm } from "@/components/AuthForm";
import { MigrationHandler } from "@/components/MigrationHandler";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <>
      <MigrationHandler />
      {children}
    </>
  );
}

function App() {
  return (
    <div className="flex flex-col h-dvh">
      <AuthProvider>
        <ThemeProvider>
          <ListProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <ListsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/list/:listId"
                  element={
                    <ProtectedRoute>
                      <ListItemsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ListProvider>
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
