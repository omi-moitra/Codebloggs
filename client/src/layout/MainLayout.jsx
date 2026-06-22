import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AutoDismissAlert from "../components/AutoDismissAlert";
import Header from "../components/Header";
import PostModal from "../components/PostModal";
import Sidebar from "../components/Sidebar";
import MainContent from "./MainContent";
import { PresenceProvider } from "../context/PresenceContext";

// MainLayout wraps pages that belong to the signed-in app experience.
const MainLayout = () => {
  const navigate = useNavigate();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handlePostCreated = (result) => {
    const message = result?.message || "Post created successfully.";
    setFeedback({ message, variant: "success" });
    window.dispatchEvent(
      new CustomEvent("codebloggs:post-created", {
        detail: { post: result?.post || null },
      })
    );
  };

  const handleAccountSettings = () => {
    navigate("/settings");
  };

  return (
    <PresenceProvider>
      <div className="app-shell">
        <Header
          onAccountSettings={handleAccountSettings}
          onOpenPostModal={() => setIsPostModalOpen(true)}
        />
        {feedback ? (
          <AutoDismissAlert
            className="app-feedback"
            dismissible
            onClose={() => setFeedback(null)}
            variant={feedback.variant}
          >
            {feedback.message}
          </AutoDismissAlert>
        ) : null}
        <div className="app-layout">
          <Sidebar />
          <MainContent />
        </div>
        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onCreated={handlePostCreated}
        />
      </div>
    </PresenceProvider>
  );
};

export default MainLayout;
