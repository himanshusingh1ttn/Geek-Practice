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
                user:'himanshu.singh1@tothenew.com',
                pass:'atcsnaadbwhsoyor'
            }
        });
        const mailOptions={
            from:'himanshu.singh1@tothenew.com',
            to:email,
            subject:'for verification mail',
            html:'<p>Hi'+name+',please click here to <a href="http://127.0.0.1:3000/verify?id='+userId+'"> Verify </a> your mail.</p>'
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

//login user method start 

const loginLoad = async(req,res)=>{
    try{
      res.render('login');
    }catch(err){
        console.log(err.message);
    }
}


const verifyLogin = async(req,res) => {
    try{
        const email = req.body.email;
        const password= req.body.password;

       const userData =  await User.findOne({email:email});
       if(userData){
          const passwordmatch = await bcrypt.compare(password,userData.password);
          if(passwordmatch){
              if(userData.is_verified===0){
                res.render('login',{message:"Please verify your mail"});
              }
              else{
                  req.session.user_id = userData._id;

                 res.redirect('/home');
              }
          }
          else{
            res.render('login',{message:"Email and password is incorrect"});
          }
       }
       else{
           res.render('login',{message:"Email and password is incorrect"});
       }
    }
    catch(err){
        console.log(err.message);
    }
}

const loadHome = async(req,res)=>{
    try {
        res.render('home');
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/');
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {loadRegister,insertUser,verifyMail,loginLoad,verifyLogin,loadHome,userLogout};
