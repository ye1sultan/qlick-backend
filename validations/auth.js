import { body, check } from 'express-validator';

export const scanValidations = [
    body('qrToken')
        .not()
        .isEmpty()
        .withMessage('QR token is required')
];

export const loginValidations = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

export const registerValidations = [
    body('fullName')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2 })
        .withMessage('Full name must be at least 2 characters long'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .trim()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('avatarUrl')
        .optional()
        .trim()
        .isURL()
        .withMessage('Invalid URL format for avatar'),

    body('role')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Role is required'),

    body('priority')
        .isInt({ min: 1 })
        .withMessage('Priority must be a positive integer'),

    body('dateOfBirth')
        .not()
        .isEmpty()
        .withMessage('Date of birth is required')
        .isDate()
        .withMessage('Invalid date format'),

    body('placeOfResidence')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Place of residence is required'),

    check('createdBy')
        .optional()
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid creator ID format'),
];