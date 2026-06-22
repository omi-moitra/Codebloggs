import { Outlet } from "react-router-dom";

const App = () => {
  // App is the top-level route wrapper. Each child route decides whether it
  // renders by itself or inside MainLayout.
  return <Outlet />;
};

export default App;
