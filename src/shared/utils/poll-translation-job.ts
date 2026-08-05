import { newsModel, AdminNewsTranslation } from "@/app/models/news-model";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

export type TranslationJobOutcome = {
	translations: AdminNewsTranslation[];
	errors: string[];
};

const sleep = (ms: number) =>
	new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Опрашивает задачу перевода до её завершения.
 *
 * Перевод длинной статьи не укладывается в таймаут Cloudflare, поэтому сервер
 * отдаёт job_id сразу, а результат забирается короткими запросами.
 *
 * Частичный результат — не ошибка: часть языков могла перевестись, и эти
 * переводы уже оплачены, поэтому они возвращаются вместе со списком ошибок.
 */
export const pollTranslationJob = async (
	jobId: string,
	options?: { signal?: AbortSignal }
): Promise<TranslationJobOutcome> => {
	const deadline = Date.now() + POLL_TIMEOUT_MS;

	while (Date.now() < deadline) {
		if (options?.signal?.aborted) {
			throw new Error("Translation polling was cancelled");
		}

		await sleep(POLL_INTERVAL_MS);

		if (options?.signal?.aborted) {
			throw new Error("Translation polling was cancelled");
		}

		const { data } = await newsModel.getTranslationJob(jobId);
		const job = data.data;

		if (job.status === "completed") {
			return { translations: job.translations, errors: job.errors };
		}

		if (job.status === "failed") {
			throw new Error(job.errors[0] ?? "Translation job failed");
		}
	}

	throw new Error("Translation timed out");
};
