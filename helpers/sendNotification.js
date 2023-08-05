const admin = require('firebase-admin')
require('dotenv').config()

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: `${process.env.FC_PROJECT_ID}`,
    clientEmail: `${process.env.FC_CLIENT_EMAIL}`,
    privateKey: `${process.env.FC_PRIVATE_KEY.replace(/\\n/g, '\n')}`
  })
})

const sendPushNotification = (topics, title, body) => {
  const condition = topics.map(topic => `'${topic}' in topics`).join(' || ')
  const message = {
    notification: {
      title,
      body
    },
    condition,
    data: { yarns: topics.join(', ') }
  }
  admin
    .messaging()
    .send(message)
    .then(res => console.log(`Successful message: ${res}`))
    .catch(e => console.log(`error: ${e}`))
}

module.exports = {
  sendPushNotification
}
