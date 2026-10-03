import 'dotenv/config'
import { app } from './app.js'
import { connectDB } from './config/db.js'

async function startServer(): Promise<void> {
	const port = Number(process.env.PORT ?? 8080)

	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error('PORT must be an integer between 1 and 65535.')
	}

	if (!process.env.JWT_SECRET) {
		throw new Error('JWT_SECRET is not set. Configure it in backend/.env.')
	}

	await connectDB()

	const server = app.listen(port, () => {
		console.log(`Server started at http://localhost:${port}`)
	})

	server.on('error', error => {
		console.error('HTTP server failed to start:', error.message)
		process.exit(1)
	})
}

startServer().catch((error: unknown) => {
	console.error(
		'Server failed to start:',
		error instanceof Error ? error.message : 'Unknown error',
	)
	process.exit(1)
})
