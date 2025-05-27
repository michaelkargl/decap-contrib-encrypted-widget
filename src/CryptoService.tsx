import {AesLength} from "./AesLength";
import {KeyLength} from "./KeyLength";
import {EncryptionResult} from "./EncryptionResult";
import {DecryptionRequest} from "./DecryptionRequest";

export class CryptoService {

    private constructor(
        private aesLength: AesLength,
        private keyLength: KeyLength,
        private key: CryptoKey
    ) {
    }

    public static async buildAsync(
        aesLength: AesLength,
        keyLength: KeyLength
    ): Promise<CryptoService> {
        const cryptoKey = await this.generateKeyAsync(aesLength);
        return new CryptoService(aesLength, keyLength, cryptoKey);
    }

    public async encryptValueAsync(value: string): Promise<EncryptionResult> {
        let initializationVector = crypto.getRandomValues(new Uint8Array(this.keyLength));
        let aes = {name: 'AES-GCM', iv: initializationVector};
        let data = new TextEncoder().encode(value);

        const cipherText = await crypto.subtle.encrypt(aes, this.key, data);

        return {
            cipherTextBase64: Buffer.from(cipherText).toString('base64'),
            initializationVectorBase64: Buffer.from(initializationVector).toString('base64')
        };
    }

    public async decryptValueAsync(request: DecryptionRequest): Promise<string> {
        const cipherTextBuffer = Buffer.from(request.cipherTextBase64, 'base64');
        const initializationVectorBuffer = Buffer.from(request.initializationVectorBase64, 'base64');
        let aes = {name: 'AES-GCM', iv: initializationVectorBuffer};

        const contentBuffer = await crypto.subtle.decrypt(aes, this.key, cipherTextBuffer);

        return new TextDecoder().decode(contentBuffer);
    }

    private static async generateKeyAsync(aesLength: AesLength): Promise<CryptoKey> {
        return await crypto.subtle.generateKey({
            name: 'AES-GCM',
            length: aesLength
        }, false, ['encrypt', 'decrypt']);
    }

    private async deriveKeyFromSecretAsync(keyBase64: string): Promise<CryptoKey> {
        return await crypto.subtle.importKey(
            'raw',
            Buffer.from(keyBase64, 'base64'),
            {name: 'AES-GCM', length: this.aesLength},
            true,
            ['encrypt', 'decrypt']
        );
    }

}