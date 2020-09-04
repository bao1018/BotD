const redis = require("redis");

const subscriber = redis.createClient();
const publisher = redis.createClient();
import { EchoService } from '../services/echoService';
const echoSrv = new EchoService();

subscriber.on("subscribe", function(channel, count) {
  console.log('🔥Worker subscribed to inbound broker')
});

subscriber.on("message", async(channel, message) => {
  console.log("☑️ Subscriber received message in channel: " + channel);
  const messageObj = JSON.parse(message);
  await echoSrv.process(messageObj);
  publisher.publish('outbound', JSON.stringify(messageObj));

});

subscriber.subscribe("inbound");