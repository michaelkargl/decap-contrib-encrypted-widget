import React, {useEffect} from 'react';
import {CryptoService} from "./CryptoService";
import {AES_LENGTH, KEY_LENGTH} from "./Config";

export interface PreviewProps<TValue = any> {
    value?: TValue;
    getAsset?: (path: string) => any;
}


const Preview: React.FC<PreviewProps<string>> = ({value, getAsset}) => {
    const [password, setPassword] = React.useState('');
    const [content, setContent] = React.useState('');

    useEffect(() => {
        const decryptValueAsync = async (value: string, password: string) => {
            const cryptoService = await CryptoService.buildAsync(AES_LENGTH, KEY_LENGTH);
            try {
                const decrypted = await cryptoService.decryptValueAsync(value ?? '', password);
                setContent(decrypted);
            } catch (e) {
                setContent(value ?? '');
            }
        }

        // noinspection JSIgnoredPromiseFromCall
        decryptValueAsync(value ?? '', password);
    }, [value, password]);

    return (<>
        <input type='text' onChange={(e) => setPassword(e.target.value)} />
        <div>{content}</div>
    </>);
};

export default Preview;