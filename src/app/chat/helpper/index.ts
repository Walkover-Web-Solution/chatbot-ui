window['initChatWidget'] = ({ widgetToken, name, mail, number, unique_id, ...config }) => {
    if (!widgetToken) {
        throw new Error('No Widget Token Found. Make sure you have setup correctly.');
    }
};
