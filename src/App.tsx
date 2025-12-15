import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ListProvider } from "@/contexts/ListContext";
import { ListsPage } from "@/pages/ListsPage";
import { ListItemsPage } from "@/pages/ListItemsPage";
import "./App.css";

function App() {
  return (
    <div className="flex flex-col h-dvh">
      <ThemeProvider>
        <ListProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ListsPage />} />
              <Route path="/list/:listId" element={<ListItemsPage />} />
            </Routes>
          </BrowserRouter>
        </ListProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
