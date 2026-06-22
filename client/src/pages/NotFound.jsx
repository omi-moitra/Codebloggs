import { Card } from "react-bootstrap";

const NotFound = () => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Page Not Found</Card.Title>
        <Card.Text>The route you requested does not exist yet.</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default NotFound;
