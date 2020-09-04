// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';

import { config } from 'dotenv';
const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

import * as restify from 'restify';

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState, ConversationReference } from 'botbuilder';

// This bot's main dialog.
// import { EchoBot } from './bots/echoBot';
import { BrokerBot } from './bots/brokerBot';
const { CustomPromptBot } = require('./bots/customPromptBot');
const redis = require("redis");

const outboundSubscriber = redis.createClient();
const redisCli = redis.createClient();

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);
const bot = new CustomPromptBot(conversationState, userState);

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the main dialog.
const myBot = new BrokerBot();

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await myBot.run(context);
    });
});

outboundSubscriber.on("subscribe", function (channel, count) {
    console.log('🔥 Subscribed to outbound broker')
});

outboundSubscriber.on("message", async (channel, message) => {
    const msgObj = JSON.parse(message);
    redisCli.get(`conversationRef-${msgObj.id}`, async (err, res) => {
        const conversationReference: ConversationReference = JSON.parse(res);
        await adapter.continueConversation(conversationReference, async turnContext => {
            await turnContext.sendActivity(msgObj.output);
        });
    });


});
outboundSubscriber.subscribe("outbound");


