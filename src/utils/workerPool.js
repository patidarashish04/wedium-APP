import workerpool from 'workerpool';
import log from './logger';

const pool = workerpool.pool({ minWorkers: 1, maxWorkers: 5 });

// create a worker and register public functions
const shareCountWorkerPool = workerpool.pool(`${__dirname}/../workers/shareCount.js`);

const getShareCountWorker = () => shareCountWorkerPool;

const getRegularWorkerPool = () => pool;

/**
 * Offload a task to the worker. This will asynchronously execute tasks
 * @param {String} taskName The name of the task
 * @param {any} task The function which needs to be executed in the worker pool
 * @param {any} args Arguments which need to be passed to the worker
 */
const submitTaskToWorker = (workerPool, taskName, task, args) => {
	log.info(`Submitted task with name [${taskName}] to be executed in workers`);
	return workerPool.exec(task, [...args])
		.then((result) => {
			log.info(`Completed ${taskName} with response`, result);
		})
		.catch((err) => {
			log.error(`Failed ${taskName} with error`, err);
		})
		.then(() => {
			workerPool.terminate(); // terminate all workers when done
		});
};

module.exports = {
	submitTaskToWorker,
	getShareCountWorker,
	getRegularWorkerPool,
};
