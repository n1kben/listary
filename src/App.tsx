import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ListProvider } from '@/contexts/ListContext';
import { ListsPage } from '@/pages/ListsPage';
import { ListItemsPage } from '@/pages/ListItemsPage';
import "./App.css";

function App() {
  return (
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
  );
}

export default App;
