import bcrypt from "bcrypt";
import User from "../models/user-model.js"
import jwt from "jsonwebtoken"
import moment from "moment";

const self = {}

self.register = async (req, res) => {
    try {
        const { email, password, passwordConfirmation } = await req.body
        const telegramId = 6566362328
        const membershipPeriod = moment().add(5, 'minutes').toDate();
        const emailProvided = await User.findOne({
            where: {
                email: email
            }
        })
        if (emailProvided) return res.status(422).json({
            status: 422,
            message: "email already exist"
        })
        if (password !== passwordConfirmation) return res.status(422).json({
            status: 422,
            message: "password does not match"
        })
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ email, password: hashedPassword, telegramId: telegramId, membershipPeriod: membershipPeriod })

        return res.status(200).json({
            status: 200,
            message: "user registered succesfully",
            data: user
        })
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            const errors = error.errors.map((err) => err.message)
            return res.status(422).json({
                status: 422,
                message: errors
            })
        }
        console.log(error);
    }
}

self.login = async (req, res) => {
    try {

        const { email, password } = await req.body

        const account = await User.findOne({ where: { email: email } })
        if (!account) return res.status(404).json({
            status: 200,
            message: "email not found"
        })

        const comparedPassword = await bcrypt.compare(password, account.password)

        if (!comparedPassword) return res.status(422).json({
            status: 422,
            message: "password incorrect"
        })

        const token = await jwt.sign({email: account.email}, process.env.TOKEN_SECRET, {expiresIn: "1h"})
        const data = await account.update({token})

        return res.status(200).json({
            status: 200,
            message: "login succesfully",
            data: data
        })

    } catch (error) {
        console.log(error);
    }
}

export default self