// remove leading comment
const fs = require('fs');

fs.writeFileSync('public/app.css', fs.readFileSync('public/app.css').toString().slice(95));
