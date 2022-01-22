const bcrypt = require("bcryptjs");
const RegisterValidation = require("../validation/registerValidation");
const saltRounds = 10;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sign } = require("jsonwebtoken");
const DateDiff = require("date-diff");
const mailer = require("../util/mailer");
const otpgen = require("../util/otpgen");

exports.register = async (req, res) => {
  console.log(new Date());
  const { error } = RegisterValidation.validate(req.body);

  if (error) return res.status(400).send(error);

  if (req.body.password !== req.body.confirm_password)
    return res.status(400).json({
      message: "Passwords do not match",
    });

  try {
    const findUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: req.body.email,
          },
          {
            username: req.body.username,
          },
        ],
      },
    });

    if (findUser)
      return res.status(400).json({ error: "Email or username exists already" });

    const otpCode = await otpgen.digits(4);
    const { password, ...user } = await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        username: req.body.username,
        password: await bcrypt.hash(req.body.password, saltRounds),
        emailVerify: otpCode,
        IsVerified: false,
        email_verify_code_sent_at: new Date()
      },
    });

    await mailer.send(
      user.email,
      "Next Node Learning OTP",
      `<h3>The NextNode Learning OTP code is ${otpCode} Please go to this link
     <a href=${process.env.SERVER_URL}/api/emailverify style={color: "red"}> Server Link </a>
      </h3>
      
      `
    );
    res.json({
      message: "Please check your email for OTP code",
      resendLink: `${process.env.SERVER_URL}/api/resendEmailCode/${user.email}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (!user) return res.json({ error: "Invalid Credentials" });

    let checkPassword = await bcrypt.compare(req.body.password, user.password);
    if (!checkPassword) return res.status(400).json({ error: "Invalid Credentials" });

    const token = sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.emailVerify = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        email_verify_code_sent_at: true,
        emailVerify: true,
      },
    });
    if (!user) return res.status(404).json({ error: "OTP Failed" });
    let t1 = new Date();
    let diff = t1.getTime() - user.email_verify_code_sent_at.getTime();
   // let diff = new DateDiff(Date.now(), user.email_verify_code_sent_at);
    if (diff > (43200 * 1000)) return res.json({ error: "OTP Expired" });

    if (user.emailVerify != otpCode)
      return res.json({ error: "OTP Incorrect" });

    let updatedUser = await prisma.user.update({
      where: {
        email: req.body.email,
      },
      data: {
        IsVerified: true,
      },
    });

    res.json({ message: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.resendEmailCode = async (req, res) => {
  try {
    console.log(req.params.email);
    const otpCode = await otpgen.digits(4);
    const email = req.params.email;

    let user = await prisma.user.findUnique({
      where: {
        email: email
      },
    });

    if (!user) return res.status(404).json({ error: "Invalid Email" });

    let updatedUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        emailVerify: otpCode,
        email_verify_code_sent_at: new Date()
      },
    });

    await mailer.send(
      user.email,
      "Next Node Learning OTP",
      `<h1>The NextNode Learning OTP code is ${otpCode} <br /> Please go to this link
   <a href=${process.env.SERVER_URL}/api/emailverify> Server Link </a>
    </h1>`
    );
    res.json({ message: "Please check your email for OTP code" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

