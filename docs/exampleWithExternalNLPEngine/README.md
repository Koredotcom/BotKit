
This BotKit example demonstrates how external NLP engines can be plugged to enhance Kore.ai Bot experience

Folow the below steps to run this example Bot

- Define Bot under Kore.ai with a dialog task
- Define the intent under Api.ai, train and update the example code for API and keys
- Define the intent and entities with Luis.ai for entity extraction, train and update the example code for API and keys
- Run BotKit node.js server with app.js pointing to "exampleWithExternalNLPEngine.js"
- Enable BotKit module inside Kore.ai, point it to the BotKit server running, to intercept user and bot messages
