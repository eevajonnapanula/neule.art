const admin = require('firebase-admin')
require('dotenv').config()

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: `${process.env.FC_PROJECT_ID}`,
    clientEmail: `${process.env.FC_CLIENT_EMAIL}`,
    privateKey: `${process.env.FC_PRIVATE_KEY.replace(/\\n/g, '\n')}`
  })
})

const sendPushNotification = topics => {
  const topicsToBeUsed = topicsIntoChunks([...new Set(topics)])

  topicsToBeUsed.forEach(topic => formConditionAndSendNotification(topic))
}

const formConditionAndSendNotification = topics => {
  const condition = topics.map(topic => `'${topic}' in topics`).join(' || ')
  const message = {
    condition,
    data: { yarns: topics.join(', ') }
  }
  admin
    .messaging()
    .send(message)
    .then(res => console.log(`Successful message: ${res}`))
    .catch(e => console.log(`error: ${e}`))
}

const topicsIntoChunks = topics => {
  const chunkAmount = Math.ceil(topics.length / 5)
  return getChunk(topics, [], chunkAmount)
}

const getChunk = (topics, chunks, times) => {
  if (times == 1) {
    const chunk = topics
    return [...chunks, chunk]
  } else {
    const chunk = topics.slice(0, 5)
    const nextTopics = topics.slice(5)
    return getChunk(nextTopics, [...chunks, chunk], times - 1)
  }
}

module.exports = {
  sendPushNotification
}
