//@todo write real tests

const express = require("express");
const app = express();

app.get("/", function(req, res) {
    console.log(res);
    res.body = 'ayyyy'
    console.log(res.body);
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
