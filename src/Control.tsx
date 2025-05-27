import React, {useEffect} from 'react';

const AES_LENGTH = 128;
const KEY_LENGTH = 16; // 16, 24, 32

export interface DecapControlProps<TValue = any> {
    onChange: (value: TValue) => void,
    forID?: string,
    value?: string,
    classNameWrapper: () => void,
    onOpenMediaLibrary: () => void,
}

export interface EncryptionResult {
    cipherTextBase64: string,
    initializationVectorBase64: string
}

export interface DecryptionRequest {
    cipherTextBase64: string,
    initializationVectorBase64: string
    cryptoKey: CryptoKey
}

async function deriveKeyFromSecretAsync(keyBase64: string): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        'raw',
        Buffer.from(keyBase64, 'base64'),
        {name: 'AES-GCM', length: AES_LENGTH},
        true,
        ['encrypt', 'decrypt']
    );
}

async function encryptValueAsync(value: string, cryptoKey: CryptoKey): Promise<EncryptionResult> {
    const encoder = new TextEncoder();
    const valueBuffer = encoder.encode(value);

    let initializationVector = crypto.getRandomValues(new Uint8Array(KEY_LENGTH));
    const cipherText = await crypto.subtle.encrypt(
        {name: 'AES-GCM', iv: initializationVector},
        cryptoKey,
        valueBuffer);
    return {
        cipherTextBase64: Buffer.from(cipherText).toString('base64'),
        initializationVectorBase64: Buffer.from(initializationVector).toString('base64')
    };
}

async function generateKeyAsync(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey({
        name: 'AES-GCM',
        length: AES_LENGTH
    }, false, ['encrypt', 'decrypt']);
}

async function decryptValueAsync(request: DecryptionRequest): Promise<string> {
    const encoder = new TextEncoder();

    const cipherTextBuffer = Buffer.from(request.cipherTextBase64, 'base64');
    const initializationVectorBuffer = Buffer.from(request.initializationVectorBase64, 'base64');
    const contentBuffer = await crypto.subtle.decrypt(
        {name: 'AES-GCM', iv: initializationVectorBuffer},
        request.cryptoKey,
        cipherTextBuffer);

    return new TextDecoder().decode(contentBuffer);
}

export const Control: React.FC<DecapControlProps<string>> = (props) => {
    const [rawValue, setRawValue] = React.useState(props.value);

    useEffect(() => {
        async function encryptDecryptAsync(value: string): Promise<void> {
            if (value === null || value === undefined) {
                return;
            }

            const cryptoKey = await generateKeyAsync();
            const encrypted = await encryptValueAsync(value, cryptoKey);
            try {
                const decrypted = await decryptValueAsync({...encrypted, cryptoKey});
                props.onChange(decrypted);
            } catch(e) {
                console.error(e);
                props.onChange(encrypted.cipherTextBase64);
            }
        }
        encryptDecryptAsync(rawValue ?? '');
    }, [rawValue]);

    return (
        <div className='control-component'>
            <p>Control.jsx, You can put some text into <code>&lt;input /&gt;</code></p>
            <textarea defaultValue={props.value}
                      onChange={(e) => setRawValue(e.target.value)}></textarea>
        </div>
    )
}

export default Control;