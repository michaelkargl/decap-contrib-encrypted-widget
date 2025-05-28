import React, {useEffect} from 'react';
import {AesLength} from "./AesLength";
import {KeyLength} from "./KeyLength";
import {CryptoService} from "./CryptoService";

const AES_LENGTH: AesLength = 128;
const KEY_LENGTH: KeyLength = 16;

export interface DecapControlProps<TValue = any> {
    onChange: (value: TValue) => void,
    forID?: string,
    value?: string,
    classNameWrapper: () => void,
    onOpenMediaLibrary: () => void,
}


export const Control: React.FC<DecapControlProps<string>> = (props) => {
    const [rawValue, setRawValue] = React.useState(props.value);

    useEffect(() => {
        async function encryptDecryptAsync(value: string, password: string): Promise<void> {
            if (value === null || value === undefined) {
                return;
            }

            const cryptoService = await CryptoService.buildAsync(AES_LENGTH, KEY_LENGTH);
            const encrypted = await cryptoService.encryptValueAsync(value, password);
            try {
                const decrypted = await cryptoService.decryptValueAsync(encrypted, `${password}`);
                props.onChange(`${decrypted} ===> ${encrypted}`);
            } catch (e) {
                console.error(e);
                props.onChange(encrypted);
            }
        }

        encryptDecryptAsync(rawValue ?? '', 'secret-password').then(console.log);
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
