export type Result<T, E extends Error> = [T, null] | [null, E];

export const ok = <T>(data: T): Result<T, never> => [data, null];

export const err = <E extends Error>(error: E): Result<never, E> => [
	null,
	error,
];

export const isOk = <T, E extends Error>(
	result: Result<T, E>,
): result is Result<T, E> => result[0] !== null;

export const isErr = <T, E extends Error>(
	result: Result<T, E>,
): result is Result<never, E> => result[0] === null;
