const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};



const urlsForUser = (id) => {
  let result = null
  for (let ids in urlDatabase){
    if (id === urlDatabase[ids].userID) {
      console.log(urlDatabase[ids].longURL)
    }

  }
  return result;
}


console.log(urlsForUser("aJ48lW"))