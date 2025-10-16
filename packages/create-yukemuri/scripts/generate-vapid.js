#!/usr/bin/env node

const { generateVAPIDConfig } = require('./dist/utils/vapid.js')
const fs = require('fs')
const path = require('path')

console.log('🔑 Generating VAPID keys for push notifications...\n')

try {
  const result = generateVAPIDConfig()
  
  console.log('📋 VAPID Keys Generated:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Public Key:  ${result.keys.publicKey}`)
  console.log(`Private Key: ${result.keys.privateKey}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // .envファイルに追加
  const envPath = path.join(process.cwd(), '.env')
  const envExists = fs.existsSync(envPath)
  
  const envContent = `
# VAPID Keys for Push Notifications ♨️
VITE_VAPID_PUBLIC_KEY=${result.keys.publicKey}
VAPID_PRIVATE_KEY=${result.keys.privateKey}
VAPID_SUBJECT=mailto:your-email@example.com

`
  
  if (envExists) {
    fs.appendFileSync(envPath, envContent)
    console.log('✅ VAPID keys added to existing .env file')
  } else {
    fs.writeFileSync(envPath, envContent.trim())
    console.log('✅ Created .env file with VAPID keys')
  }
  
  console.log('\n💡 Next steps:')
  console.log('1. Update VAPID_SUBJECT with your email address')
  console.log('2. Keep VAPID_PRIVATE_KEY secret (use in server-side only)')
  console.log('3. Restart your dev server to use the new keys')
  console.log('\n♨️ Happy coding with Yukemuri!')
  
} catch (error) {
  console.error('❌ Failed to generate VAPID keys:', error.message)
  process.exit(1)
}