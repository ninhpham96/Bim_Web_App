self.onmessage = (event) => {
    const { action, payload } = event.data;
    switch (action) {
        case 'onLoad': {
            console.log('onLoad', payload);
            break;
        }
        default: {
            console.error('Unknown action', action);
            break;
        }
    }
};
