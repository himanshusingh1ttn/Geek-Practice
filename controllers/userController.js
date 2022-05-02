const User = require('../models/userModel');

const loadRegister = async (req,res)=>{
    try{
       res.render('registration');

    }catch(err){
        console.log(err.message)
    }

}
module.exports = {loadRegister};
