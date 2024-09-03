import { Queue } from "queue-typescript";

/**
 * Clear given queue.
 *
 * Note that although the cleared queue is returned, clear actions is still
 * performed on given object directly without any type of copying.
 *
 * @param queue Queue to be cleared
 * @return Cleared queue
 */
export function clearQueue<Type>(queue: Queue<Type>): Queue<Type> {
  while (queue.length > 0) queue.dequeue();

  return queue;
}

export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}
