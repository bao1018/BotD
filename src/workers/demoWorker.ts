const redis = require("redis");

const subscriber = redis.createClient();
const redisCli = redis.createClient();
import { EchoService } from '../services/echoService';
import { BaseService } from "../services/baseService";
import { CardService } from "../services/cardService";
import { FlowService } from "../services/flowService";
import { CustomizedDialog } from '../models/session'

import { RedisUtil } from '../utils/redisUtil'


export class DemoWorker {

  public static async listen() {
    subscriber.on("subscribe", function (channel, count) {
      console.log('🔥 Worker subscribed to inbound broker')
    });

    subscriber.on("message", async (channel, message: string) => {
      console.log("Subscriber received message in channel: " + channel + " value: " + message);
      const dialog: CustomizedDialog = await RedisUtil.get(message);
      const srv = this.getServiceType(dialog.userSession.input.value);
      await srv.process(dialog.userSession);
      RedisUtil.set(message, dialog, 60*60);
      this.sendToOutbound(message);
    });
    subscriber.subscribe("inbound");

  }

  public static sendToOutbound(message: string) {
    redisCli.publish('outbound', message);
  }

  public static getServiceType(userInput: string): BaseService {
    switch (userInput) {
      case '1': {
        return new CardService();
      }
      case '2': {
        return new FlowService();
      }
      default: {
        return new EchoService();
      }
    }

  }


}

DemoWorker.listen();

