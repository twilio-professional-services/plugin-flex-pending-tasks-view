import * as EventEmitter from "eventemitter3";

/**
 * Lifted from Flex monorepo
 */
 
const tick = new EventEmitter();

window.setInterval(() => {
  tick.emit("tick");
}, 1000);

export function addTickListener(handler) {
  tick.on.call(tick, "tick", handler);
} 
export function removeTickListener(handler) {
  tick.off.call(tick, "tick", handler);
} 