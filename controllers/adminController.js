const User=require("../models/userModel")

const bcrypt=require('bcrypt');
const randomstring=require('randomstring')
const config=require('../config/config')
const nodemailer=require('nodemailer');
const Mail = require('nodemailer/lib/mailer');

const addUserMail=async(name,email,password,userId)=>{
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
            subject:'Admin add you and Verify your mail',
            html:'<p>Hi'+name+',please click here to <a href="http://127.0.0.1:3000/verify?id='+userId+'"> Verify </a> your mail.</p><br> <b>Email:</b>'+email+'<br><b>Password:</b>'+password+''
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

//Add new user
const newUserLoad=async(req,res)=>{
    try {
        res.render('new-user');
    } catch (error) {
        console.log(error.message);
    }
}

const addUser=async(req,res)=>{
    try {
        const name=req.body.name;
        const email=req.body.email;
        const mobile=req.body.mno;
        const image=req.file.filename;
        const password=randomstring.generate(8);
        const spass=await securePassword(password);
        const user=new User({
            name:name,email:email,mobile:mobile,image:image,password:spass,is_admin:0
        })
        const userData=await user.save();
        if(userData){
            addUserMail(name,email,password,userData._id);
            res.redirect('/admin/dashboard')
        }
        else{
            res.render('new-user',{message:"Something Wrong"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

//edit user functionality
const editUserLoad=async(req,res)=>{
    try {
        const id=req.query.id;
        const user= await User.findById({_id:id})
        if(user){
            res.render('edit-user',{user:user});

        }
        else{
            res.redirect('/admin/dashboard')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateUsers=async(req,res)=>{
    try {
        const userdData=await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mno,is_verified:req.body.verify}})

        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteUser=async(req,res)=>{
    try {
        const id=req.query.id;
        await User.deleteOne({_id:id});        
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={loadLogin,verifyLogin,loadDashboard,logout,forgetLoad,forgetVerify,forgetPasswordLoad,resetPassword,admindashboard,newUserLoad,addUser,editUserLoad,updateUsers,deleteUser}