import { useEffect, useRef, useState } from "react";
import { Alert } from "react-bootstrap";
import PropTypes from "prop-types";

export const TOAST_AUTO_DISMISS_MS = 10000;

const AutoDismissAlert = ({
  autoDismissMs = TOAST_AUTO_DISMISS_MS,
  children,
  onClose,
  ...alertProps
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
      onCloseRef.current?.();
    }, autoDismissMs);

    return () => window.clearTimeout(timeoutId);
  }, [autoDismissMs, children]);

  const handleClose = () => {
    setIsVisible(false);
    onCloseRef.current?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert {...alertProps} onClose={handleClose}>
      {children}
    </Alert>
  );
};

AutoDismissAlert.propTypes = {
  autoDismissMs: PropTypes.number,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
};

export default AutoDismissAlert;
