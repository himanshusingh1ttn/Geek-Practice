const User = require('../models/userModel');

const bcrypt=require('bcrypt')

const nodemailer=require('nodemailer');
const Mail = require('nodemailer/lib/mailer');
const securePassword=async(password)=>{
    try {
        const passwordHash=await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
// for send verification Mail.
const sendVerifyMail=async(name,email,userId)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:'587',
            secure:false,
            requireTLS:true,
            auth:{
                user:'bhaskar.fulara@tothenew.com',
                pass:''
            }
        });
        const mailOptions={
            from:'bhaskar.fulara@tothenew.com',
            to:email,
            subject:'for verification mail',
            html:'<p>Hi'+name+',please click here to <a href="http://127.0.0.1:3000/verify?id= '+userId+'"> Verify </a> your mail.</p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Mail has been sent",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}




const loadRegister = async (req,res)=>{
    try{
       res.render('registration');

    }catch(err){
        console.log(err.message)
    }

}


const insertUser=async(req,res)=>{
    try{
        const spassword=await securePassword(req.body.password);
        const user =new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassword,
            is_admin:0
        });
        const userData=await user.save();
        if(userData){
            sendVerifyMail(req.body.name,req.body.email,userData._id);
            res.render('registration',{message:"Your registration done.Please verify your mail."})
        }
        else{
            res.render('registration',{message:"Your registration failed."})
        }
    }
    catch(error){
        console.log(error.message);
    }
}
const verifyMail=async(req,res)=>{
    try {
        const updatedInfo=await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})
        console.log(updatedInfo);
        res.render("email-verified");

    } catch (error) {
        console.log(error.message);
        
    }
}


module.exports = {loadRegister,insertUser,verifyMail};
