/**
 * Minimal server-sent-events fan-out, replacing Base44's `entity.subscribe()`.
 * Clients open one EventSource per entity; every mutation broadcasts a small
 * change notice and the client refetches.
 */

const channels = new Map(); // entityName -> Set<res>

export function addSubscriber(entityName, res) {
  if (!channels.has(entityName)) channels.set(entityName, new Set());
  channels.get(entityName).add(res);
  return () => {
    const set = channels.get(entityName);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) channels.delete(entityName);
  };
}

export function broadcast(entityName, event) {
  const set = channels.get(entityName);
  if (!set || set.size === 0) return;
  const payload = `data: ${JSON.stringify({ entity: entityName, ...event })}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
    } catch {
      set.delete(res);
    }
  }
}

export const subscriberCount = () =>
  [...channels.values()].reduce((total, set) => total + set.size, 0);
