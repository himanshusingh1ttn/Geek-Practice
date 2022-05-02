const express = require("express");
const user_route  = express();

const userController = require("../controllers/userController");


user_route.get('/register',userController.loadRegister);


module.export = user_route;