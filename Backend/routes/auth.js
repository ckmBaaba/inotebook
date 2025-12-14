const express = require('express');
const User = require('../models/User');

const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchUser');

const JWT_SECRET = 'Harryisgoodb$oy'

//Route 1 :Create a user using: POST "/api/auth/createuser" . No loging required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password').isLength({ min: 5 }),
], async (req, res) => {
    //if there are error, return Bad error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //check whether email exists already
    try {

        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry an email already exists" })
        }

        const salt = await bcrypt.genSalt(10);

        const secPass = await bcrypt.hash(req.body.password, salt)
        //Create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);


        res.json({ authtoken })
    } catch (error) {
        res.status(500).send("Internal server error occurred");

    }

})


//Route 2: Authenticate a user using: POST "/api/auth/createuser" . No loging required

router.post('/login', [

    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password cannot be blank').exists(),

], async (req, res) => {

    //if there are error, return Bad error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credential" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with correct credential" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);


        res.json({ authtoken })

    }


    catch (error) {
        res.status(500).send("Internal server errorr");


    }

})

//Route 3: Get loggedin User details using: POST "/api/auth/getuser" . loging required
router.post('/getuser', fetchuser, async (req, res) => {


    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)

    } catch (error) {

        console.error(error.message);
        res.status(500).send("Internal server errorr");

    }
})
module.exports = router