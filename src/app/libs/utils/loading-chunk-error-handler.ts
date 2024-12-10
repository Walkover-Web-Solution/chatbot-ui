import { ErrorHandler } from '@angular/core';

export class LoadingChunkErrorHandler implements ErrorHandler {
    handleError(error: any): void {
        const chunkFailedMessage = /Loading chunk .* failed/;
        if (chunkFailedMessage.test(error?.message) || error?.name === 'ChunkLoadError') {
            window.location.reload();
        }
        console.error(error);
    }
}
