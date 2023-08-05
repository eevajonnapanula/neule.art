const admin = require('firebase-admin')

const serviceAccount = require('../service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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

sendPushNotification(['0059', '0051'], 'Lankavahti', 'Uusia lankoja saatavilla!')
