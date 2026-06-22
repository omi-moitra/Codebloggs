import { useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import AutoDismissAlert from "../components/AutoDismissAlert";

const adminTools = [
  {
    id: "users",
    title: "User Manager",
    description: "Review account management tools planned for the next admin module.",
    message: "User Manager is under construction and coming in Module 10.",
  },
  {
    id: "content",
    title: "Content Manager",
    description: "Prepare for future content review and moderation workflows.",
    message: "Content Manager is under construction and coming in Module 10.",
  },
];

const Admin = () => {
  const [feedback, setFeedback] = useState("");

  return (
    <section className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Admin</h1>
          <p>Module 9 admin tools are staged here for future management workflows.</p>
        </div>
      </div>

      {feedback ? (
        <AutoDismissAlert
          className="admin-page__alert"
          dismissible
          onClose={() => setFeedback("")}
          variant="info"
        >
          {feedback}
        </AutoDismissAlert>
      ) : null}

      <Row className="g-4">
        {adminTools.map((tool) => (
          <Col md={6} key={tool.id}>
            <Card
              as="button"
              className="admin-tool h-100"
              onClick={() => setFeedback(tool.message)}
              type="button"
            >
              <Card.Body>
                <Card.Title as="h2">{tool.title}</Card.Title>
                <Card.Text>{tool.description}</Card.Text>
                <span>Coming in Module 10</span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default Admin;
