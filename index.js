const express = require('express');
const bodyParser = require('body-parser');
require('./models/index');
const userCtrl = require('./controllers/userController');
const transactionCtrl = require('./controllers/TransactionController');
const { verifyToken } = require('./middlewares/authMiddleware');

const app = express();
app.use(bodyParser.json());

// Auth Module API
app.post('/register', userCtrl.Register);
app.post('/login', userCtrl.Login);
app.get('/getProfile', verifyToken, userCtrl.getProfile);
app.put('/editProfile', verifyToken, userCtrl.editProfile);

// Transaction Module API
app.post('/addAmount', verifyToken, transactionCtrl.addAmount);
app.post('/makeTransaction', verifyToken, transactionCtrl.makeTransaction);
app.get('/getCategoryList', verifyToken, transactionCtrl.getCategoryList);
app.get('/getAllTransaction', verifyToken, transactionCtrl.getAllTransaction);
app.get('/getWalletBalance', verifyToken, transactionCtrl.getWalletBalance);
app.get('/getWalletHistory', verifyToken, transactionCtrl.getWalletHistory);
app.delete('/deleteTransaction', verifyToken, transactionCtrl.deleteTransaction);

app.listen(3001, () => {
    console.log("app is running on http://localhost:3001");
});
