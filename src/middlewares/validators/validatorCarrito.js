const { check, validationResult } = require('express-validator')

const validateResult = (req, res, next) => {
    try {
        validationResult(req).throw()
        return next()
    } catch (error) {
        res.send({ errors: error.array() })
    }
}

const validateCarrito = [
    check('productos')
        .exists()
        .not(),
    (req, res, next) => {
    validateResult(req, res, next)
    }
]

module.exports = validateCarrito