// unique 'branded' type
export type UUID = string & { readonly __brand: unique symbol }

export type EncryptedColumn = Uint8Array[];