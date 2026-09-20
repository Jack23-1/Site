import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const local = path.join(root, '.local-postgres')
const data = path.join(local, 'data')
const socket = path.join(local, 'socket')
const envFile = path.join(root, '.env')
const run = (program, args, options = {}) => execFileSync(program, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options })
const action = process.argv[2] || 'start'
try {
  if (!['start', 'stop'].includes(action)) throw new Error('Utilisez db:local ou db:stop.')
  if (action === 'stop') {
    run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop'])
    console.log('PostgreSQL local arrêté.')
    process.exit(0)
  }
  const fresh = !existsSync(path.join(data, 'PG_VERSION'))
  if (fresh && existsSync(envFile)) throw new Error('.env existe déjà. Configurez la base existante ou déplacez ce fichier avant de créer une nouvelle base locale.')
  mkdirSync(local, { recursive: true, mode: 0o700 })
  mkdirSync(socket, { recursive: true, mode: 0o700 })
  if (fresh) {
    const passwordFile = path.join(local, 'bootstrap-password')
    writeFileSync(passwordFile, randomBytes(32).toString('hex'), { mode: 0o600, flag: 'wx' })
    try { run('initdb', ['-D', data, '-U', 'postgres', '--auth-local=trust', '--auth-host=scram-sha-256', '--encoding=UTF8', '--locale=C', `--pwfile=${passwordFile}`]) }
    finally { unlinkSync(passwordFile) }
    // Paths can contain spaces; PostgreSQL config values escape single quotes by doubling them.
    writeFileSync(path.join(data, 'postgresql.auto.conf'), `listen_addresses = '127.0.0.1'\nport = 55432\nunix_socket_directories = '${socket.replaceAll("'", "''")}'\n`)
  }
  let running = false
  try { run('pg_ctl', ['-D', data, 'status']); running = true } catch { /* Cluster is stopped. */ }
  if (!running) run('pg_ctl', ['-D', data, '-l', path.join(local, 'postgres.log'), '-w', 'start'])
  if (fresh) {
    const password = randomBytes(32).toString('hex')
    run('psql', ['-h', socket, '-p', '55432', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], {
      input: `CREATE ROLE onip LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE;\nCREATE DATABASE onip OWNER onip;\nCREATE DATABASE onip_test OWNER onip;\n`,
    })
    writeFileSync(envFile, `DATABASE_URL="postgresql://onip:${password}@127.0.0.1:55432/onip?schema=public"\nTEST_DATABASE_URL="postgresql://onip:${password}@127.0.0.1:55432/onip_test?schema=public"\nAPP_ORIGIN="http://localhost:5173"\nHOST="127.0.0.1"\nPORT=3001\nTRUST_PROXY_HOPS=0\n`, { mode: 0o600, flag: 'wx' })
  }
  console.log('PostgreSQL local disponible sur 127.0.0.1:55432. Configuration privée dans backend/.env.')
} catch (error) {
  // Never print child input or environment: they can contain database passwords.
  console.error(error.status !== undefined ? 'La commande PostgreSQL a échoué. Consultez .local-postgres/postgres.log ; vérifiez aussi que PostgreSQL est installé et que le port 55432 est libre.' : error.message)
  process.exitCode = 1
}
