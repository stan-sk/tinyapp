const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");


// middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'cookieMonster', // this is what the user will see when they inspect their cookies
  keys: ["verspecialkey", "veryveryspecialkey"], // re-encrypt under a certain time

// Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

function generateRandomString() {
  let result           = "";
  let characters       = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  let length = 6;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUserByEmail = (email) => {
  let user = null
  for (let ids in usersDatabase){
    if (email === usersDatabase[ids].email) {
      user = usersDatabase[ids]
    } 
  }
  return user;
}

const usersDatabase = {
  abc: {
    id: "abc",
    email: "abc@gmail.com",
    password: "1234"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "abc",
   },
  i3BoG5: {
    longURL: "https://www.apple.ca",
    userID: "abc",
  }
};

const urlsForUser = (id) => {
  let obj = {};
  for (let ids in urlDatabase) {
    if (id === urlDatabase[ids].userID) {
      obj[ids] = urlDatabase[ids]
    }
  }
  return obj
}

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: usersDatabase[req.session.user_id]
  };

  if (!req.session.user_id) {
    return res.redirect("/login")
    }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const shortURLid = generateRandomString()

  urlDatabase[shortURLid] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
    
  if (!req.session.user_id) {
    return res
    .send("Please Log in first")
    }

  res.redirect(`/urls/${shortURLid}`); 
});

app.post("/urls/:id/delete", (req, res) => {

const userUrls = urlsForUser(req.session.user_id)
const id = req.params.id
const userId = req.session.user_id

if (urlDatabase[id] === undefined) {
  return res.send("The URL you are trying to delete does not exist")
}
if (!req.session.user_id) {  
  return res.send("You must log in first to delete a URL")
}
if (userUrls[id].userID !== userId) {
  return res.send("No authorization to delete this URL")
}

  delete urlDatabase[req.params.id];
  
  res.redirect("/urls"); 
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: usersDatabase[req.session.user_id]
  };

  if (req.session.user_id) {
    return res.redirect("/urls")
    }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const randomUserId = generateRandomString()
  const email = req.body.email
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    return res
    .status(400)
    .send("Sorry registration unsuccessful")
  }
  if (getUserByEmail(email) !== null) {
    return res
    .status(400)
    .send("Email already exisits")
  }
    usersDatabase[randomUserId] = {
      id: randomUserId,
      email: email,
      password: hashedPassword
    }
  
    // create this cookie during registration
    req.session.user_id = randomUserId
    res.redirect("/urls");  
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: usersDatabase[req.session.user_id]
  };

  if (req.session.user_id) {
    return res.redirect("/urls")
  }

  res.render("login", templateVars);
})

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = getUserByEmail(email)

  if ( !user || !bcrypt.compareSync(password, user.password)) {
    return res
    .status(403)
    .send("Invalid email or password")
  }


// set the cookie from th returning object
  req.session.user_id = user.id
  res.redirect("/urls")
})

// clear the cookie
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/login")
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
 
  if (!urlDatabase[req.params.id]) {
    return res
    .send ("The short url ID does not exist")
  }
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: usersDatabase[req.session.user_id]
  };
  
    if (!req.session.user_id) {
    return res
    .send("You must log in first")
  }

  let userOnlyURL = urlsForUser(req.session.user_id);

  if (userOnlyURL[req.params.id] === undefined) {
    return res
    .send("No access")
  }

  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {

let userOnlyDb = urlsForUser(req.session.user_id) 
  
  const templateVars = { 
    urls: userOnlyDb,
    user: usersDatabase[req.session.user_id]
   };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

 // if you click on shortId on the page, you then get redirected to the longURL 
 // Action only, not a page
 app.get("/u/:id", (req, res) => {
   if (!urlDatabase[req.params.id]) {
     return res
     .send ("The short url ID does not exist")
   }
  const longURL = urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

// edit shortURL with a different longURL
app.post('/urls/:id', (req, res) => {
const userUrls = urlsForUser(req.session.user_id)
const id = req.params.id
const userId = req.session.user_id

if (urlDatabase[id] === undefined) {
  return res.send("The URL you are trying to edit does not exist")
}
if (!req.session.user_id) {  
  return res.send("You must log in first to edit a URL")
}
if (userUrls[id].userID !== userId) {
  return res.send("No authorization to edit this URL")
}

urlDatabase[req.params.id] = {
  longURL: req.body.longURL,
  userID: req.session.user_id
}

  res.redirect("/urls/");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});