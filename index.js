require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:3000"],
    })
  );


//Import Routes 

const authRoute = require("./routes/auth");

//Use Routes

app.use("/api", authRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=> console.log(`Server listening on port ${PORT}`));