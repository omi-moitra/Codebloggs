import { useEffect, useMemo, useRef, useState } from "react";
import { Form, ListGroup } from "react-bootstrap";
import PropTypes from "prop-types";
import locations from "../data/locations.json";

const LocationAutocomplete = ({
  value,
  onChange,
  required,
  maxLength,
  isInvalid,
}) => {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (query.length < 2) {
      return [];
    }

    return locations
      .filter((location) => location.toLowerCase().startsWith(query))
      .slice(0, 6);
  }, [value]);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleInputChange = (event) => {
    onChange(event.target.value);
    setIsOpen(true);
  };

  const handleSelect = (location) => {
    onChange(location);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="position-relative">
      <Form.Control
        autoComplete="off"
        isInvalid={isInvalid}
        maxLength={maxLength}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        required={required}
        value={value}
      />
      {isOpen && suggestions.length > 0 ? (
        <ListGroup
          className="position-absolute top-100 start-0 w-100 shadow-sm"
          style={{ zIndex: 1050 }}
        >
          {suggestions.map((location) => (
            <ListGroup.Item
              action
              as="button"
              key={location}
              onClick={() => handleSelect(location)}
              type="button"
            >
              {location}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : null}
    </div>
  );
};

LocationAutocomplete.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  maxLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isInvalid: PropTypes.bool,
};

export default LocationAutocomplete;
