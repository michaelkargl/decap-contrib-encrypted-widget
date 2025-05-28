import {AesLength} from "./AesLength";
import {KeyLength} from "./KeyLength";

// noinspection UnnecessaryLocalVariableJS
export class CryptoService {
    private static readonly DEFAULT_AES_LENGTH: AesLength = 256;
    private static readonly DEFAULT_KEY_LENGTH: KeyLength = 32;
    private static readonly DEFAULT_SALT_LENGTH = 16;
    private static readonly DEFAULT_PBKDF2_ITERATIONS = 100000;

    private constructor(
        private aesLength: AesLength,
        private keyLength: KeyLength,
        private pbkdf2Iterations: number,
        private saltLength: number
    ) {
    }

    public static async buildAsync(
        aesLength: AesLength = this.DEFAULT_AES_LENGTH,
        keyLength: KeyLength = this.DEFAULT_KEY_LENGTH,
        pbkdf2Iterations = this.DEFAULT_PBKDF2_ITERATIONS,
        saltLength = CryptoService.DEFAULT_SALT_LENGTH
    ): Promise<CryptoService> {
        return new CryptoService(aesLength, keyLength, pbkdf2Iterations, saltLength);
    }

    /**
     * Encrypts a string using AES-GCM.
     * @param value - The cleartext string to encrypt
     * @param password - Password for encryption
     * @returns Promise resolving to the encrypted result
     */
    public async encryptValueAsync(
        value: string,
        password: string
    ): Promise<string> {
        const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
        const initializationVector = crypto.getRandomValues(new Uint8Array(this.keyLength));
        const key = await this.deriveKeyFromPasswordAsync(password, salt);

        const ciphertext = await crypto.subtle.encrypt(
            {name: 'AES-GCM', iv: initializationVector},
            key,
            new TextEncoder().encode(value)
        );

        // Combine the salt, iv, and ciphertext
        const result = new Uint8Array(salt.length + initializationVector.length + ciphertext.byteLength);
        result.set(salt, 0);
        result.set(initializationVector, salt.length);
        result.set(new Uint8Array(ciphertext), salt.length + initializationVector.length);

        const base64Result = CryptoService.toBase64(result)
        return base64Result;
    }

    /**
     * Decrypts an encrypted string.
     * @param valueBase64 - The encrypted string to decrypt
     * @param password - Password for decryption (if not using a pre-generated key)
     * @returns Promise resolving to the decrypted string
     */
    public async decryptValueAsync(
        valueBase64: string,
        password: string
    ): Promise<string> {
        const data = CryptoService.fromBase64(valueBase64);

        // Extract the salt, iv, and ciphertext
        const salt = data.slice(0, this.saltLength);
        const iv = data.slice(this.saltLength, this.saltLength + this.keyLength);
        const ciphertext = data.slice(this.saltLength + this.keyLength);
        const key = await this.deriveKeyFromPasswordAsync(password, salt);

        const decrypted = await crypto.subtle.decrypt(
            {name: 'AES-GCM', iv},
            key,
            ciphertext
        );

        let clearText = new TextDecoder().decode(decrypted);
        return clearText;
    }

    private static toBase64(bytes: Uint8Array): string {
        return btoa(String.fromCharCode(...bytes))
    }

    private static fromBase64(value: string): Uint8Array {
        const bytes = atob(value).split('').map(c => c.charCodeAt(0));
        return new Uint8Array(bytes)
    }

    private async deriveKeyFromPasswordAsync(
        password: string,
        salt: Uint8Array
    ): Promise<CryptoKey> {
        // First, create a PBKDF2 key from the password
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            {name: 'PBKDF2'},
            false,
            ['deriveKey']
        );

        // Then derive an AES-GCM key using PBKDF2
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: this.pbkdf2Iterations,
                hash: 'SHA-256'
            },
            passwordKey,
            {name: 'AES-GCM', length: this.aesLength},
            false,
            ['encrypt', 'decrypt']
        );
    }
}
