import { BrowserRouter, Route, Routes } from "react-router-dom";
import Viewer from "./pages/Viewers/Viewer";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<>Hello</>} />
        <Route path="*" element={<>Lỗi rồi bạn ơi!!!</>} />
        <Route path="/viewer" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
