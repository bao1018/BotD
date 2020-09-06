import { BaseService } from "../services/baseService";
import { EchoService } from "../services/echoService";
import { CardService } from "../services/cardService";
import { FlowService } from "../services/flowService";

export class DecisionUtil {
    public static getServiceType(userInput: string): BaseService{
        switch(userInput) {
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