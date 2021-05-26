import { Manager } from "@twilio/flex-ui";

class ContextUtilType {
    showSupervisor() {
        const manager = Manager.getInstance();
        const { roles } = manager.user;
        return roles.indexOf("supervisor") >= 0 || roles.indexOf("admin") >= 0;
    }
}

export const ContextUtil = new ContextUtilType();