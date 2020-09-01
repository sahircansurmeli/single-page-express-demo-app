const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use("/", express.static(__dirname + '/public'));

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`App listening at port: ${port}`);
});