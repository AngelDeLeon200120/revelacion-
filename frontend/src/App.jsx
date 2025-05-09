import { BrowserRouter, Routes, Route } from "react-router-dom";
import Invitacion from "./components/Invitacion";
import ConfirmacionForm from "./components/ConfirmacionForm";
import PanelAdmin from "./components/PanelAdmin";
import Respuesta from "./components/Respuesta";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Invitacion />} />
        <Route path="/confirmar" element={<ConfirmacionForm />} />
        <Route path="/admin" element={<PanelAdmin />} />
        <Route path="/respuesta" element={<Respuesta />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

