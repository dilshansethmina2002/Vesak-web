import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import CardMaker from "./pages/CardMaker";
import Profile from "./pages/Profile";
import CreatePost from './pages/CreatePost';
import ViewCard from './pages/ViewCard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<CardMaker />} />
          <Route path="profile" element={<Profile />} />
          <Route path="share" element={<CreatePost />} />
          <Route path="card/:id" element={<ViewCard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;