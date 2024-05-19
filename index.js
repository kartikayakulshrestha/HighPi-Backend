const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const Token = require("./models/Token");
const sendEmail = require("./utils/sendEmails");
const crypto = require("crypto");
const User = require("./models/users");
const cookies = require("cookies");

require("dotenv").config();

const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({limit:"50mb", extended: false }));
app.use(bodyParser.json({limit:"50mb",}));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

function passwordencrypt(password) {
  return bcrypt.hashSync(password, 10);
}

function tokenCreation(data) {
  let res = jwt.sign(
    { _id: data._id, name: data.firstname + " " + data.lastname },
    process.env.SECREAT
  );
  return res;
}
app.post("/login", async (req, res) => {
  
  try {
    let user = await User.findOne({ email: req.body.email });
    
    if (user) {
      const unhash = bcrypt.compareSync(
        String(req.body.password),
        String(user.password)
      );
      
      if (unhash) {
        let tokenn = tokenCreation(user);
      
        /* let person = await user.updateOne(
          { _id: user._id },
          { tokens: { token: String(tokenn) } }
        ); */
        if(!user.verified){
          return res.json({message:"pleaseverify"})
        }
        
        let l=res.setHeader("Set-Cookie", `highpiId=${tokenn}`);
        
        return res.json({ message: "success" });
      } else {
        return res.json({ message: "passwordIsWrong" });
      }
    } else {
      return res.json({ message: "nouser" });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "email not exist" });
  }
});
app.post("/signin", async (req, res) => {
  try {
    let password = String(passwordencrypt(req.body.password));
    let user = await new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: password,
    });

    const saveuser = await user.save();

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const url = `${process.env.BASE_URL}user/${user._id}/verify/${token.token}`;
    console.log(url);
    await sendEmail(user.email, "HighPi - Verification mail", url);
    
    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.json({ message: "email exist" });
  }
});

app.get("/user/:id/verify/:token", async (req, res) => {
  let user = await User.findOne({ _id: req.params.id });
  let tokenverify = await Token.findOne({ userId: req.params.id });
  console.log(String(user._id), tokenverify.userId);
  if (String(user._id) === tokenverify.userId) {
    console.log(tokenverify.token === req.params.token);
    if (tokenverify.token === req.params.token) {
      user["verified"] = true;

      await User.updateOne({ _id: user._id }, user);

      res.json("User verified!");
    } else {
      res.json("User do not have right key");
    }
  } else {
    res.json("User is invalid");
  }
});

app.post("/verifyy",async (req,res)=>{
  console.log(req.body.email)
  let  x = await User.findOne({email:req.body.email})
  console.log(x)
  if(x.verified===null){
    return res.send(false)
  }
  if(x.verified===true){
    return res.send(true)
  }
  else{
    return res.send(false)
  }
  
})

app.post("/uploadphoto",async (req,res)=>{
  console.log(req.headers.cookie)
  res.send("aaya ki nahi")
})

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is running at http://localhost:${PORT}/`);
  }
});
