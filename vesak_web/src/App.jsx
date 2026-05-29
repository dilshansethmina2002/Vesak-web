import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import CardMaker from "./pages/CardMaker";
import Profile from "./pages/Profile";
import CreatePost from './pages/CreatePost';
import ViewCard from './pages/ViewCard';
import VesakZone from "./pages/VesakZone";
import AdminDashboard from "./pages/AdminDashboard";
import { Analytics } from "@vercel/analytics/next";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin" element={<AdminDashboard  />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<CardMaker />} />
          <Route path="profile" element={<Profile />} />
          <Route path="zone" element={<VesakZone />} />
          <Route path="share" element={<CreatePost />} />
          <Route path="card/:id" element={<ViewCard />} />
        </Route>
      </Routes>
      <Analytics />
    </BrowserRouter>
    

  );
}

export default App;