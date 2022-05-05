const User=require("../models/userModel")

const bcrypt=require('bcrypt');
const randomstring=require('randomstring')
const config=require('../config/config')
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
const sendResetPasswordMail=async(name,email,token)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:'587',
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPass
            }
        });
        const mailOptions={
            from:config.emailUser,
            to:email,
            subject:'For reset password',
            html:'<p>Hi'+name+',please click here to <a href="http://127.0.0.1:3000/admin/forget-password?token='+token+'">Reset</a> your password.</p>'
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

const loadLogin=async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin=async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        const userData=await User.findOne({email:email});
        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_admin===0){
                    res.render('login',{message:"Email and password is incorrect"});
                }
                else{
                    req.session.user_id=userData._id;
                    res.redirect('/admin/home');
                }
            }
            else{
                res.render('login',{message:"Email and password is incorrect"});
            }
        }
        else{
            res.render('login',{message:"Email and password is incorrect"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard=async(req,res)=>{
    try {
        const userData=await User.findById({_id:req.session.user_id});
        res.render('home',{admin:userData});
    } catch (error) {
        console.log(error.message)
    }
}

const logout=async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad=async(req,res)=>{
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message)
    }
}


const forgetVerify=async(req,res)=>{
    try {
        const email=req.body.email
        const userData=await User.findOne({email:email});
        if(userData){
            if(userData.is_admin===0){
                res.render('forget',{message:'Email is incorrect'});
            }
            else{
                const randomString=randomstring.generate();
                const updatedData=await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forget',{message:'Please Check your mail to reset password'})
            }
        }
        else{
            res.render('forget',{message:'Email is incorrect'});
        }
    } catch (error) {
        console.log(error.message)
    }
}

const forgetPasswordLoad=async(req,res)=>{
    try {
        const token=req.query.token;
        const tokenData=await User.findOne({token:token});
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id})
        }
        else{
            res.render('404',{message:"Invalid Link"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const resetPassword=async(req,res)=>{
    try {
        const password=req.body.password;
        const user_id=req.body.user_id;
        const securepassword=await securePassword(password);
        const userData=await User.findByIdAndUpdate({_id:user_id},{$set:{password:securepassword,token:''}})
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
const admindashboard = async(req,res)=>{
    try {
        const usersData= await User.find({is_admin:0})
        res.render('dashboard',{users:usersData});
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={loadLogin,verifyLogin,loadDashboard,logout,forgetLoad,forgetVerify,forgetPasswordLoad,resetPassword,admindashboard}