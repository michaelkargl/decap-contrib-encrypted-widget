import React, {useEffect} from 'react';
import {CryptoService} from "./CryptoService";
import {AES_LENGTH, KEY_LENGTH} from "./Config";

export interface PreviewProps<TValue = any> {
    value?: TValue;
    getAsset?: (path: string) => any;
}


const Preview: React.FC<PreviewProps<string>> = ({value}) => {
    const [password, setPassword] = React.useState('');
    const [decrypted, setDecrypted] = React.useState('');
    const [decryptError, setDecryptError] = React.useState(false);

    useEffect(() => {
        if (!value || !password) {
            setDecrypted('');
            setDecryptError(false);
            return;
        }

        const tryDecrypt = async () => {
            const service = await CryptoService.buildAsync(AES_LENGTH, KEY_LENGTH);
            try {
                const result = await service.decryptValueAsync(value, password);
                setDecrypted(result);
                setDecryptError(false);
            } catch {
                setDecrypted('');
                setDecryptError(true);
            }
        };

        tryDecrypt();
    }, [value, password]);

    return (
        <div> 
            <div>
                <strong>Content:</strong>
                <p>{decrypted || value || ''}</p>
            </div>
            <div>
                <label>Password: <input type="password" onChange={(e) => setPassword(e.target.value)}/></label>
                {decryptError && <span> Incorrect password</span>}
            </div>
        </div>
    );
};

export default Preview;
