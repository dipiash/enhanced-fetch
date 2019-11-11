export const enhancedFetch = (options = {}) => {
    const _container = {};
    const _options = {
        baseUrl: options.baseUrl,
    };

    _container.createInstance = (options = {}) => {
        return enhancedFetch(options);
    };

    _container.fetch = (url, {signal, ...options} = {}, timeout, onTimeoutClb) => {
        const controller = new AbortController();
        const fetchUrl = _options.baseUrl ? _options.baseUrl + url : url;

        const request = fetch(fetchUrl, {
            signal: controller.signal,
            ...options,
        });

        if (signal) {
            signal.addEventListener('abort', () => controller.abort());
        }

        let timeoutRequest = null;
        if (!isNaN(timeout) && timeout !== null && timeout >= 0) {
            timeoutRequest = setTimeout(() => {
                controller.abort();

                if (onTimeoutClb) {
                    onTimeoutClb();
                }
            }, timeout);
        }

        return request.finally(() => clearTimeout(timeoutRequest));
    };

    _container.abortController = () => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        return {
            abort: () => {
                abortController.abort();
            },
            signal
        }
    };

    return _container;
};
