const { StatusCodes, Messages } = require('../Constant');
const db = require('../models');
const User = db.User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SecretKey = "secretkey";


const Register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.Name,
            });
        }
        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.Email,
            });
        } if (!password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.PassWord,
            });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.UserExist,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, SecretKey, { expiresIn: '1h' });
        res.status(StatusCodes.CREATED).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.RegisterSuccess,
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.Error,
            error: error.message,
        });
    }
};

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.Email,
            });
        }
        if (!password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.PassWord,
            });
        }
        const userExist = await User.findOne({ where: { email } });
        if (!userExist) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.InvalideCredentials,
            });
        }
        const isPasswordValid = await bcrypt.compare(password, userExist.password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.InvalideCredentials,
            });
        }

        const token = jwt.sign({ id: userExist.id, email: userExist.email }, SecretKey, { expiresIn: '1h' });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.LoginSuccess,
            token,
            user: { id: userExist.id, email: userExist.email, name: userExist.name },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.Error,
            error: error.message,
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusCodes.STATUSERROR,
                message: Messages.UserId,
            });
        }
        const userExist = await User.findOne({ where: { id: userId } });
        if (userExist) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.STATUSSUCCESS,
                message: Messages.DataSuccess,
                data: { id: userExist.id, name: userExist.name, email: userExist.email, createdAt: userExist.createdAt },
            });
        }
        return res.status(StatusCodes.NOT_FOUND).json({ status: StatusCodes.STATUSERROR, message: Messages.UserNotExist });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.Error, error: error.message });
    }
};

const editProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.STATUSERROR, message: Messages.UserId });
        }
        if (!name) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.STATUSERROR, message: Messages.Name });
        }
        const userExist = await User.findOne({ where: { id: userId } });
        if (userExist) {
            await User.update({ name }, { where: { id: userId } });
            return res.status(StatusCodes.OK).json({ status: StatusCodes.STATUSSUCCESS, message: Messages.UpdateSuccess });
        }
        return res.status(StatusCodes.NOT_FOUND).json({ status: StatusCodes.STATUSERROR, message: Messages.UserNotExist });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.Error, error: error.message });
    }
};

module.exports = {
    Register,
    Login,
    getProfile,
    editProfile,
};

