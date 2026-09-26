import 'dotenv/config'
import { app } from './app.js'
import { connectDB } from './config/db.js'

async function startServer(): Promise<void> {
	const port = Number(process.env.PORT ?? 8080)

	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error('PORT 1 dan 65535 gacha bo‘lgan butun son bo‘lishi kerak.')
	}

	await connectDB()

	const server = app.listen(port, () => {
		console.log(`Server http://localhost:${port} manzilida ishga tushdi.`)
	})

	server.on('error', error => {
		console.error('HTTP server ishga tushmadi:', error.message)
		process.exit(1)
	})
}

startServer().catch((error: unknown) => {
	console.error(
		'Server ishga tushmadi:',
		error instanceof Error ? error.message : 'Noma’lum xato',
	)
	process.exit(1)
})
