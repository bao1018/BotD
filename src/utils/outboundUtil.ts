import { BotFrameworkAdapter, MessageFactory, TurnContext, ConversationReference } from 'botbuilder';
const redis = require("redis");

const outboundSubscriber = redis.createClient();
const redisCli = redis.createClient();

export class OutboundUtil {

    public static async listen( adapter: BotFrameworkAdapter) {
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
    }

}