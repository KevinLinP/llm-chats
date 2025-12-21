/**
 * Utility functions for converting database buffer values to Uint8Array.
 * The Neon HTTP driver may return ArrayBuffer or Uint8Array, so we normalize to Uint8Array.
 */

/**
 * Converts a buffer value (ArrayBuffer or Uint8Array) to Uint8Array.
 * Used for non-nullable buffer fields.
 */
export function toUint8Array(value: ArrayBuffer | Uint8Array): Uint8Array {
	return value instanceof Uint8Array ? value : new Uint8Array(value);
}

/**
 * Converts a nullable buffer value (ArrayBuffer or Uint8Array) to Uint8Array | null.
 * Used for nullable buffer fields.
 */
export function toUint8ArrayOrNull(
	value: ArrayBuffer | Uint8Array | null | undefined
): Uint8Array | null {
	return value
		? value instanceof Uint8Array
			? value
			: new Uint8Array(value)
		: null;
}

