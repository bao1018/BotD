import { BotFrameworkAdapter, Activity, Attachment, CardFactory, MessageFactory } from 'botbuilder';
import { CustomizedDialog, MessageType } from '../models/session'

const redis = require("redis");
const outboundSubscriber = redis.createClient();
const redisCli = redis.createClient();
import * as fs from 'fs';
import * as path from 'path';

export class OutboundUtil {

    public static async listen(adapter: BotFrameworkAdapter) {
        outboundSubscriber.on("subscribe", function (channel, count) {
            console.log('🚗 Subscribed to outbound broker')
        });

        outboundSubscriber.on("message", async (channel, message) => {
            console.log("Subscriber received message in channel: " + channel + " value: " + message);
            redisCli.get(message, async (err, res) => {
                const dialog: CustomizedDialog = JSON.parse(res);
                await adapter.continueConversation(dialog.conRef, async turnContext => {
                    if (dialog.userSession.output.type === MessageType.card) {
                        const cardFile = JSON.parse(
                            fs.readFileSync(path.join(__dirname, "../cards/" + dialog.userSession.output.value + ".json"))
                                .toString()
                        );
                        const card: Attachment = CardFactory.adaptiveCard(cardFile);
                        const message: Partial<Activity> = MessageFactory.attachment(card);
                        await turnContext.sendActivity(message);
                    } else if (dialog.userSession.output.type === MessageType.text) {
                        await turnContext.sendActivity(dialog.userSession.output.value);
                    } else {
                        console.error('Can not identify message type');
                    }
                });
            });

        });
        outboundSubscriber.subscribe("outbound");
    }

}