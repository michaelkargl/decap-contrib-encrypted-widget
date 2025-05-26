import PropTypes from 'prop-types';
import React from 'react';

export interface DecapControlProps<TValue = any> {
    onChange: (value: TValue) => void,
    forID?: string,
    value?: string,
    classNameWrapper: () => void,
    onOpenMediaLibrary: () => void,
}

export const Control: React.FC<DecapControlProps<string>> = (props) => {
    return (
        <div className='control-component'>
            <p>Control.jsx, You can put some text into <code>&lt;input /&gt;</code></p>
            <textarea defaultValue={props.value}
                      onChange={(e) => props.onChange(e.target.value)}></textarea>
        </div>
    )
}

export default Control;