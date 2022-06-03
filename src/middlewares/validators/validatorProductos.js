const { check, validationResult } = require('express-validator')

const validateResult = (req, res, next) => {
    try {
        validationResult(req).throw()
        return next()
    } catch (error) {
        res.send({ errors: error.array() })
    }
}

const validateProductos = [
    check('nombre')
        .exists()
        .not()
        .isEmpty(),
    check('descripcion')
        .exists()
        .not()
        .isEmpty(),
    check('codigo')
        .exists()
        .not()
        .isEmpty(),
    check('foto')
        .exists()
        .not()
        .isEmpty(),
    check('precio')
        .exists()
        .not()
        .isEmpty()
        .isNumeric(),
    check('stock')
        .exists()
        .not()
        .isEmpty()
        .isNumeric(),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

module.exports = validateProductos