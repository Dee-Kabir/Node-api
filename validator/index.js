exports.userSignupValidator = (req,res,next) => {
    req.check("name","Name is required").notEmpty()
    req.check("email","Email must be between 8 to 32 characters")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @")
    .isLength({
        min: 8,
        max:32
    })
    req.check("password","password is required").notEmpty()
    .isLength({min:6})
    .withMessage("password must contain at least 6 characters")
    .isLength({max:15})
    .withMessage("password can be of max 15 characters")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
    .withMessage("password must contain a digit, a lower case and a uppercase")
    const errors = req.validationErrors();
    if(errors){
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({error: firstError});
    }

}