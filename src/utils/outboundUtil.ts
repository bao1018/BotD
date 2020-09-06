import { BotFrameworkAdapter, ConversationReference } from 'botbuilder';
import { Session, CustomizedDialog } from '../models/session'

const redis = require("redis");
const outboundSubscriber = redis.createClient();
const redisCli = redis.createClient();

export class OutboundUtil {

    public static async listen( adapter: BotFrameworkAdapter) {
        outboundSubscriber.on("subscribe", function (channel, count) {
            console.log('🔥 Subscribed to outbound broker')
        });
        
        outboundSubscriber.on("message", async (channel, message) => {
            console.log("Subscriber received message in channel: " + channel + " value: " + message);
            redisCli.get(message, async (err, res) => {
                const dialog: CustomizedDialog = JSON.parse(res);
                await adapter.continueConversation(dialog.conRef, async turnContext => {
                    await turnContext.sendActivity(dialog.userSession.output.value);
                });
            });
        
        });
        outboundSubscriber.subscribe("outbound");
    }

}