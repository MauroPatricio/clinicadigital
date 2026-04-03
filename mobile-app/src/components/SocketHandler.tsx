import React from 'react';
import useSocket from '../hooks/useSocket';

const SocketHandler: React.FC = () => {
    // This hook manages all global socket listeners and state updates
    useSocket();
    
    // This is a headless component, it doesn't render anything
    return null;
};

export default SocketHandler;
