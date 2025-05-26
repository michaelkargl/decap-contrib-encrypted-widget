import React from 'react';

export interface PreviewProps<TValue = any> {
  value?: TValue;
  getAsset?: (path: string) => any;
}

const Preview: React.FC<PreviewProps<string>> = ({ value, getAsset }) => {
  return (
    <div>Preview.jsx, {value}</div>
  );
};

export default Preview;