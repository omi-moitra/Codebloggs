import { Outlet } from "react-router-dom";
import MeshGradient from "./components/MeshGradient";
import BulgeGrid from "./components/BulgeGrid";

const App = () => (
  <>
    <MeshGradient />
    <BulgeGrid />
    <Outlet />
  </>
);

export default App;
