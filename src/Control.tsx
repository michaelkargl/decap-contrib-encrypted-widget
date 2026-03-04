import React from 'react';
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
    const [password, setPassword] = React.useState("");
    const [plaintext, setPlaintext] = React.useState("");
    const [isUnlocked, setIsUnlocked] = React.useState(!props.value);
    const [decryptError, setDecryptError] = React.useState(false);

    const handleContentChange = async (value: string) => {
        setPlaintext(value);
        if (!password) return;
        const service = await CryptoService.buildAsync(AES_LENGTH, KEY_LENGTH);
        const encrypted = await service.encryptValueAsync(value, password);
        props.onChange(encrypted);
    };

    const handlePasswordChange = async (newPassword: string) => {
        setPassword(newPassword);
        if (!newPassword) return;

        const service = await CryptoService.buildAsync(AES_LENGTH, KEY_LENGTH);

        if (props.value && !isUnlocked) {
            // Existing encrypted content — try to decrypt with this password
            try {
                const decrypted = await service.decryptValueAsync(props.value, newPassword);
                setPlaintext(decrypted);
                setIsUnlocked(true);
                setDecryptError(false);
            } catch {
                setDecryptError(true);
            }
        } else if (plaintext) {
            // No existing content, or already unlocked — re-encrypt plaintext with updated password
            const encrypted = await service.encryptValueAsync(plaintext, newPassword);
            props.onChange(encrypted);
        }
    };

    return (
        <div className='control-component'>
            <div className='password-input-group'>
                <label htmlFor='password'>Password</label>
                <input id='password' type="password" onChange={(e) => handlePasswordChange(e.target.value)}/>
                {decryptError && <span>Incorrect password</span>}
            </div>
            {isUnlocked
                ? (
                    <div className='content-input-group'>
                        <label htmlFor='content'>Content</label>
                        <textarea id='content' value={plaintext}
                                  onChange={(e) => handleContentChange(e.target.value)}/>
                    </div>
                ) : (
                    props.value && <p>Content is encrypted. Enter password to edit.</p>
                )
            }
        </div>
    );
};

export default Control;
