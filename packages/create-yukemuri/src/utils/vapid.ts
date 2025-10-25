import crypto from 'crypto'

export function generateVAPIDKeys() {
  // Generate VAPID public and private key pair
  const keyPair = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  })

  // Base64URL encoding
  const publicKey = keyPair.publicKey.subarray(-65).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const privateKey = keyPair.privateKey.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_') 
    .replace(/=/g, '')

  return {
    publicKey,
    privateKey
  }
}

export function generateVAPIDConfig() {
  const keys = generateVAPIDKeys()
  
  return {
    keys,
    config: `// VAPID configuration
export const VAPID_CONFIG = {
  publicKey: '${keys.publicKey}',
  privateKey: '${keys.privateKey}', // Manage in server environment variables
  subject: 'mailto:your-email@example.com' // Change to your email address
}

// Public key only for PWA usage
export const VAPID_PUBLIC_KEY = '${keys.publicKey}'`
  }
}