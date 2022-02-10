const express = require("express");
const path = require("path");
const app = express();

app.listen(8080, () => {
    console.log('Application listening on port 8080!');
});

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.get("/info", (req, res) => {
    res.sendFile(`${__dirname}/public/info.html`)
})