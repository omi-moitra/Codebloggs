// =============================================================================
// MainLayout.jsx — Authenticated app shell
// -----------------------------------------------------------------------------
// 1. State            isPostModalOpen, feedback banner
// 2. Handlers         handlePostCreated, handleAccountSettings
// 3. Layout           app-shell → Header → app-layout (Bootstrap grid)
//    - Sidebar col    Col lg={2} d-none d-lg-block — hidden below 992px
//    - Content col    Col lg={10} xs={12} — expands to full width below 992px
// 4. Modals           PostModal (global; triggered from Header Post button)
// =============================================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import AutoDismissAlert from "../components/AutoDismissAlert";
import Header from "../components/Header";
import PostModal from "../components/PostModal";
import Sidebar from "../components/Sidebar";
import MainContent from "./MainContent";
import { emitPostCreated } from "../services/postEventBus";
import { PresenceProvider } from "../context/PresenceContext";

// MainLayout wraps pages that belong to the signed-in app experience.
const MainLayout = () => {
  const navigate = useNavigate();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handlePostCreated = (result) => {
    const message = result?.message || "Post created successfully.";
    setFeedback({ message, variant: "success" });
    emitPostCreated(result?.post || null);
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

        {/* Bootstrap grid layout:
            - Sidebar col (lg=2) is hidden below the lg breakpoint (992px) via
              d-none d-lg-block; the Header's hamburger toggle shows the nav instead.
            - Content col (lg=10 / xs=12) expands to full width automatically when
              the sidebar col is hidden — no explicit CSS override needed. */}
        <Container fluid className="app-layout p-0">
          <Row className="g-0">
            <Col lg={2} className="d-none d-lg-block">
              <Sidebar />
            </Col>
            <Col lg={10} xs={12}>
              <MainContent />
            </Col>
          </Row>
        </Container>

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
