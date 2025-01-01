const { QueryTypes, Model, where } = require('sequelize');
const { StatusCodes, Messages } = require('../Constant');
var db = require('../models');
var User = db.User;
var Category = db.Category;
var Transation = db.Transaction;
var WalletHistory = db.WalletHistory;
var Wallet = db.Wallet;

const addAmount = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.STATUSERROR, message: Messages.UserId });
        }
        if (!amount) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.STATUSERROR, message: Messages.Amount });
        }
        if (amount < 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.STATUSERROR, message: Messages.AddAmount });
        }
        const userExist = await User.findOne({ where: { id: userId } });
        if (!userExist) {
            return res.status(StatusCodes.NOT_FOUND).json({ status: StatusCodes.STATUSERROR, message: Messages.UserNotExist });
        }
        let userWallet = await Wallet.findOne({ where: { userId } });
        let newBalance;
        if (userWallet) {
            newBalance = userWallet.amount + amount;
            await Wallet.update({ amount: newBalance }, { where: { userId } });
        } else {
            const newWallet = await Wallet.create({
                userId,
                amount,
            });
            newBalance = newWallet.amount;
        }
        const walletHistory = await WalletHistory.create({
            userId,
            amount,
            balanceAfterTransaction: newBalance,
        });
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.AmountAddedSuccessfully,
            data: {
                userId,
                newBalance,
                walletHistory,
            },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.Error,
            error: error.message,
        });
    }
};

const makeTransaction = async (req, res) => {
    try {
        const { categoryId, amount } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.UserId });
        }
        if (!categoryId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.CategoryId });
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Amount must be a positive number." });
        }

        const userWallet = await Wallet.findOne({ where: { userId } });
        if (!userWallet) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: Messages.UserNotExist });
        }
        if (userWallet.amount < amount) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.BalanceError });
        }

        const newBalance = userWallet.amount - amount;
        await Wallet.update({ amount: newBalance }, { where: { userId } });

        const transactionData = await Transation.create({ userId, categoryId, amount });

        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.TransactionSuccess,
            data: { transaction: transactionData, newBalance },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: Messages.Error,
            error: error.message,
        });
    }
};


const getCategoryList = async (req, res) => {
    try {
        const data = await Category.findAll({
            attributes: ["id", "categoryType"],
        });
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.DataSuccess,
            data: data
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.Error,
            error: error.message,
        });
    }
}


const getAllTransaction = async (req, res) => {
    try {
        const data = await Transation.findAll({
            include: [
                {
                    model: Category,
                    attributes: ['categoryType'],
                }
            ],
        })
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.STATUSSUCCESS,
            message: Messages.DataSuccess,
            data: [data]
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.STATUSERROR,
            message: Messages.Error,
            error: error.message,
        });
    }
}

const getWalletBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.STATUSERROR, message: Messages.UserId });
        }
        const data = await Wallet.findOne({ where: { userId } });
        if (data) {
            return res.status(StatusCodes.OK).json({ status: StatusCodes.STATUSSUCCESS, message: Messages.DataSuccess, data: data });
        } {
            return res.status(StatusCodes.NOT_FOUND).json({ status: StatusCodes.STATUSERROR, message: Messages.UserNotExist });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.Error, error: error.message });
    }
}

const getWalletHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.STATUSERROR, message: Messages.UserId });
        }
        const data = await WalletHistory.findAll({ where: { userId } });
        if (data) {
            return res.status(StatusCodes.OK).json({ status: StatusCodes.STATUSSUCCESS, message: Messages.DataSuccess, data: data });
        } {
            return res.status(StatusCodes.NOT_FOUND).json({ status: StatusCodes.STATUSERROR, message: Messages.UserNotExist });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.Error, error: error.message });
    }
}

const deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body;
        if (!transactionId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ status: StatusCodes.STATUSERROR, message: Messages.TransactionId });
        }
        const data = await Transation.findOne({ where: { id: transactionId } });
        if (data) {
            await Transation.destroy({ where: { id: transactionId } });
            return res.status(StatusCodes.OK).json({ status: StatusCodes.STATUSSUCCESS, message: Messages.DeleteSuccess });
        } {
            return res.status(StatusCodes.NOT_FOUND).json({ status: StatusCodes.STATUSERROR, message: Messages.TransactionNotExist });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: StatusCodes.STATUSERROR, message: Messages.Error, error: error.message });
    }
}


module.exports = {
    addAmount,
    makeTransaction,
    getCategoryList,
    getAllTransaction,
    getWalletBalance,
    getWalletHistory,
    deleteTransaction
}