import { check, validationResult } from "express-validator";

const validateMessageInput = [
  check("content").notEmpty().withMessage("Content is required"),
  check("senderId").isMongoId().withMessage("Invalid sender ID"),
  check("groupId").optional().isMongoId().withMessage("Invalid group ID"),
  check("recipientId")
    .optional()
    .isMongoId()
    .withMessage("Invalid recipient ID"),
];

export { validateMessageInput };
