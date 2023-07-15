require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const userRoutes = require('./Router/user-routes')
const apiErrors = require('./Middleware/error-middleware')

const app = express();
const PORT = process.env.PORT

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use('/api', userRoutes)
app.use(apiErrors)


app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`);
})