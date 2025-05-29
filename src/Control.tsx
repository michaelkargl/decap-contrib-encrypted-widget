import React, {useEffect} from 'react';
import {AesLength} from "./AesLength";
import {KeyLength} from "./KeyLength";
import {CryptoService} from "./CryptoService";
import {AES_LENGTH, KEY_LENGTH} from "./Config";



export interface DecapControlProps<TValue = any> {
    onChange: (value: TValue) => void,
    forID?: string,
    value?: string,
    classNameWrapper: () => void,
    onOpenMediaLibrary: () => void,
}


export const Control: React.FC<DecapControlProps<string>> = (props) => {
    const [rawValue, setRawValue] = React.useState(props.value);
    const [password, setPassword] = React.useState("");

    useEffect(() => {
        async function encryptDecryptAsync(value: string, password: string): Promise<void> {
            if (value === null || value === undefined) {
                return;
            }

            const cryptoService = await CryptoService.buildAsync(AES_LENGTH, KEY_LENGTH);
            const encrypted = await cryptoService.encryptValueAsync(value, password);
            props.onChange(`${encrypted}`);
        }

        encryptDecryptAsync(rawValue ?? '', password).then(console.log);
    }, [rawValue, password]);

    return (
        <div className='control-component'>
            <p>Control.jsx, You can put some text into <code>&lt;input /&gt;</code></p>

            <div className='password-input-group'>
                <label htmlFor='password'>Password</label>
                <input id='password' type="text" onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <div className='content-input-group'>
            <label htmlFor='content'>Content</label>
            <textarea id='content' defaultValue={props.value}
                      onChange={(e) => setRawValue(e.target.value)}></textarea>
            </div>
        </div>
    )
}

export default Control;
