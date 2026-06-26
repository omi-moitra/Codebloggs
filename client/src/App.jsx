import { Outlet } from "react-router-dom";
import MeshGradient from "./components/MeshGradient";
import BulgeGrid from "./components/BulgeGrid";
import CursorParticles from "./components/CursorParticles";

const App = () => (
  <>
    <MeshGradient />
    <BulgeGrid />
    <CursorParticles />
    <Outlet />
  </>
);

export default App;
