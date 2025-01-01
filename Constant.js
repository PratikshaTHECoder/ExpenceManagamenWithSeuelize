module.exports = {
    StatusCodes: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
        CREATED: 201,
        OK: 200,
        CONFLICT: 409,
        STATUSERROR: 0,
        STATUSSUCCESS: 1
    },
    Messages : {
        Name: "Name field is required!",
        Email: "Email field is required!",
        UserId: "User id field is required!",
        PassWord: "Password field is required!",
        TransactionId: "Transaction id field is required!",
        Amount: "Amount field is required!",
        AddAmount: "Amount should not in minus!",
        UserNotExist: "User does not exist with this ID!",
        UserExist: "User already exists with this email!",
        TransactionNotExist: "Transaction not exist with this id!",
        AmountAddedSuccessfully: "Amount added successfully!",
        Error: "Something went wrong!",
        CategoryId: "Category id field is required!",
        BalanceError: "Insufficient balance!",
        TransactionSuccess: "Transaction successful!",
        DataSuccess: "data fetch successful!",
        DeleteSuccess: "Deleted successfully!",
        RegisterSuccess: "User registered successfully!",
        InvalideCredentials: "Invalid email or password!",
        LoginSuccess: "Login successful!",
        UpdateSuccess: "Profile Updated Successfully!"
    }
};
