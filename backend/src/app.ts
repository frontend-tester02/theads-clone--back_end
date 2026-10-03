import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth.routes.js'
import { errorHandler } from './middleware/error-handler.js'

export const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:3000' }))
app.use(express.json())
app.use(cookieParser())

app.get('/check', (_req, res) => {
	res.json({ status: 'Welcome to Threads' })
})

app.use('/api/auth', authRouter)

// Central handler that returns errors in a single format — after all routes.
app.use(errorHandler)
