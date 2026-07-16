import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import FoodDetail from './pages/FoodDetail';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:name" element={<Profile />} />
          <Route path="/food/:id" element={<FoodDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
