import { BrowserRouter, Route, Routes } from "react-router-dom";
import Viewer from "./pages/Viewers/Viewer";
import Home from "./pages/Home/Home";
import Project from "./pages/Project/Project";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/project" element={<Project />} />
        <Route path="*" element={<>Lỗi rồi bạn ơi!!!</>} />
        <Route path="/viewer" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
