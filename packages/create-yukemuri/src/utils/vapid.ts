import crypto from 'crypto'

export function generateVAPIDKeys() {
  // VAPID公開鍵と秘密鍵のペアを生成
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

  // Base64URLエンコード
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
    config: `// VAPID設定
export const VAPID_CONFIG = {
  publicKey: '${keys.publicKey}',
  privateKey: '${keys.privateKey}', // サーバー環境変数で管理してください
  subject: 'mailto:your-email@example.com' // あなたのメールアドレスに変更
}

// PWAで使用する公開鍵のみ
export const VAPID_PUBLIC_KEY = '${keys.publicKey}'`
  }
}