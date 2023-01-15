import { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queues: AsyncIterable<ITask>, maxThreads = 0): Promise<void> {
    maxThreads = Math.max(0, maxThreads);
    /**
     * Код надо писать сюда
     * Тут что-то вызываем в правильном порядке executor.executeTask для тасков из очереди queue
     */

    const executingTasks = new Map<string, Promise<void>>();

    const taskPromises: Array<Promise<void>> = [];

    for (const queue of queues as any) {
        if (executingTasks.has(queue.targetId)) {
            // Wait for the currently executing task with this targetId to complete
            await executingTasks.get(queue.targetId);
        }

        // Check if the number of currently executing tasks has reached the maximum allowed
        if (executingTasks.size >= maxThreads) {
            // Wait for the next task to complete before starting a new one
            await Promise.race(executingTasks.values());
        }

        // Start executing the task and add it to the map of executing tasks
        const taskPromise = queue.execute();
        taskPromises.push(taskPromise);
        executingTasks.set(queue.targetId, taskPromise);
    }

    // Wait for all tasks to complete
    await Promise.all(taskPromises);
}
