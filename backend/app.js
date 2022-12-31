const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const mergedDataset = require("./scraper/merged.json");
const {
  merge_and_store_results,
  get_merged_results,
} = require("./scraper/utils/mergefiles");

// Official_Signup Schema
const User = require("./models/college_signup");

// Official_Login Schema
// const User_Login = require("./models/official_login");

// Authentic_Colleges Schema
const Authentic_College = require("./models/authentic_colleges");

// Fake_University Schema
const Fake_Univ = require("./models/fake_university");

// College_Data Schema
const College_Data = require("./models/college_Data");

const connectToMongo = require("./db");
connectToMongo();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "../backend/views"));
app.set("view engine", "ejs");

const staticpath = path.join(__dirname, "../frontend");

app.use(express.static(staticpath));

// Get Request
app.get("/", (req, res) => {
  res.send("Server is runing on PORT:3000");
});

// Get Request
app.get("/authentic_college", (req, res) => {
  Authentic_College.find(
    { universityname: req.query.universityname },
    (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        res.render("search", { details: docs });
      }
    }
  );
});

// Get Request
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
});

//Get Request
app.get("/ugcofficial", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  if (password === "admin123" && username === "admin") {
    // res.send("Welcome ADMIN");
    College_Data.find({}, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        res.render("colleges", { details: docs });
        // console.log(docs);
      }
    });
  } else {
    res.send("Enter correct password");
    console.log(password);
  }
});

//fake university
app.get("/fakeuniv", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/fake.html"));
});
console.log(path.join(__dirname, "../frontend/fake.html"));
// POST reqquest
app.post(
  "/official_signup",
  body("email").isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const usernameExists = await User.findOne({
        username: req.body.username,
      });
      const error = validationResult(req);
      if (usernameExists) return res.status(400).send("Username already taken");
      if (error.isEmpty() != true) {
        res.send("Email is not valid");
      } else {
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;
        let user_email_check = await User.findOne({ email: req.body.email });
        if (user_email_check) {
          res.send("A user with the same email already exist");
        } else if (password === confirmpassword) {
          const user = new User({
            universityname: req.body.universityname,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
          });
          const official_user = await user.save();
          res.sendFile(
            path.join(__dirname, "../frontend/registration_successful.html")
          );
        } else {
          res.send("Password are not matching");
        }
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

// Post Request
app.post("/official_login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    // const user = await User_Login.findOne({ username: username });
    const user = await User.findOne({ username: username });

    if (user.password === password) {
      res.sendFile(path.join(__dirname, "../frontend/applyform.html"));
    } else {
      res.send("Please enter your correct password");
    }
  } catch (error) {
    res.status(400).send("Invalid");
  }
});

/**
 * This function will search for a university name in the state, deemed, private and central universities through the merged.json file
 * @params{university_name:String} -> the university you are searching for
 */
app.get("/search_university", (req, res, next) => {
  if (!req.query.university_name) {
    return next(new Error("Pass university_name in the query parameter"));
  }
  let searchable_dataset = {};
  if (!mergedDataset) {
    //merged data set is empty
    searchable_dataset = get_merged_results();
  } else {
    searchable_dataset = mergedDataset;
  }
  let correct_index = -1;
  for (let i = 0; i < searchable_dataset.data.length; i++) {
    if (
      searchable_dataset.data[i].university_name.toLowerCase().trim() ==
      req.query.university_name.toLowerCase().trim()
    ) {
      correct_index = i;
      break;
    }
  }
  if (correct_index != -1) {
    res.render("searchresult", {
      temp: "1",
      universityname: [searchable_dataset.data[correct_index].university_name],
      address: [searchable_dataset.data[correct_index].address],
      state: [searchable_dataset.data[correct_index].state],
    });
  } else {
    res.render("searchresult", {
      temp: "0",
      universityname: "NA",
      address: "NA",
      state: "NA",
    });
  }
});

// Post Request
app.post("/contactus", (req, res) => {
  console.log(req.body);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "asmitwrites@gmail.com",
      pass: "futcvasqifumkqzl",
    },
  });

  const mailOptions = {
    from: req.body.email,
    to: "hv65616@gmail.com",
    subject: `Message from ${req.body.email}: ${req.body.subject}`,
    text: req.body.message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send("error");
    } else {
      console.log("Email sent: " + info.response);
      res.send("success");
    }
  });
});

// Post Request
app.post("/applyform", async (req, res) => {
  try {
    let college_email = await College_Data.findOne({ email: req.body.email });
    if (college_email) {
      res.send(
        "College with this email id is already registered in our system"
      );
    } else {
      const college_data = new College_Data({
        applicationnumber: req.body.applicationnumber,
        universityname: req.body.universityname,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        state: req.body.stateut9,
        geolocation: req.body.geolocation,
        contact: req.body.contact,
        email: req.body.email,
        website: req.body.website,
        programmes: req.body.programmes,
        other91: req.body.other91,
        uploadlink1: req.body.upload92,
        nba: req.body.nba,
        uploadlink2: req.body.upload93,
        naac: req.body.naac,
        uploadlink3: req.body.upload94,
        otheraccre: req.body.other,
        uploadlink4: req.body.upload95,
      });
      const data = await college_data.save();
      res.sendFile(path.join(__dirname, "../frontend/applyformsuccess.html"));
    }
  } catch (error) {
    res.send("Some internal error occured");
    console.log(error);
  }
});

app.post("/accepted", (req, res) => {});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (req, res) => {
  console.log(`Server started on port ${PORT}`);
});
