import { body } from "express-validator";

export const registerValidators = [
  body("first_name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("last_name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location must be 100 characters or fewer"),
  body("occupation")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Occupation must be 100 characters or fewer"),
];
