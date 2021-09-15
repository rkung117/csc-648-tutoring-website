const express = require('express')
const app = express()

app.use(express.static('static'))

// This line sets the port during deployment or sets to default of 3020 before
// starting the server. Do not change this line as it may cause deployment
// to break.
const port = process.env.PORT || 3020
app.listen(port, () => console.log('Server started on port: ', port))
