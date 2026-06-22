import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <main className="app-main">
      {/* Outlet renders the matching nested page inside the protected layout. */}
      <Outlet />
    </main>
  );
};

export default MainContent;
