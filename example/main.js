(function () {
    var logger = function (message) {
        var log = document.getElementById('log');

        if (log) {
            var div = document.createElement('div');
            div.innerHTML = message;
            log.append(div);

            log.scrollTop = log.scrollHeight;
        }
    };

    var toggleBtnState = function (btn, disabled) {
        if (btn) {
            btn.disabled = disabled;
        }
    };

    if (!window['enhancedFetch']) {
        logger('"enhancedFetch" is not defined in window scope');

        return;
    }

    var {requestByFetch} = window['enhancedFetch'];

    var btnCreate = document.getElementById('btn-create-task');
    var btnCancel = document.getElementById('btn-cancel-task');


    var fetchInstance = requestByFetch.createInstance({baseUrl: 'https://poller.jeetiss.now.sh',});
    var task = prepareTask(fetchInstance, btnCreate, btnCancel);

    btnCreate.addEventListener('click', function () {
        task.create();
    });
    btnCancel.addEventListener('click', function () {
        task.abort();
    });

    function prepareTask(fetchInstance, btnCreate, btnCancel) {
        var taskAbort = {
            requestCreate: fetchInstance.abortController(),
            requestPoll: fetchInstance.abortController(),
            abort: function () {
                this.requestCreate.abort();
                this.requestCreate = fetchInstance.abortController();

                this.requestPoll.abort();
                this.requestPoll = fetchInstance.abortController();
            }
        };

        var _taskData = {};

        return {
            create: function () {
                logger('===========================');

                toggleBtnState(btnCreate, true);
                toggleBtnState(btnCancel, false);

                fetchInstance.fetch('/post', {
                    signal: taskAbort.requestCreate.signal,
                    method: 'POST',
                    mode: "cors",
                }, 10000,)
                    .then(res => res.json())
                    .then(res => {
                        logger('Create operation: (data) ' + JSON.stringify(res));

                        if (res && res.id) {
                            toggleBtnState(btnCreate, true);
                            toggleBtnState(btnCancel, false);

                            _taskData.id = res.id;

                            this.poll(_taskData.id);
                        }
                    })
                    .catch(err => {
                        toggleBtnState(btnCreate, false);
                        toggleBtnState(btnCancel, true);

                        logger('Create operation: (error) ' + err.message);
                    })
            },
            poll: function (id) {
                var context = this;

                fetchInstance.fetch('/get?id=' + id, {
                        signal: taskAbort.requestPoll.signal,
                        mode: "cors",
                    },
                    10000,
                    function () {
                        context.poll(id, btnCreate, btnCancel);
                    }
                )
                    .then(res => res.json())
                    .then(res => {
                        logger('Poll data: (data) ' + JSON.stringify(res));

                        if (res && res.status === 'processing') {
                            context.poll(id, btnCreate, btnCancel);
                        }

                        if (res && res.status === 'done') {
                            toggleBtnState(btnCreate, false);
                            toggleBtnState(btnCancel, true);
                        }

                        if (res && res.status === 'error') {
                            toggleBtnState(btnCreate, false);
                            toggleBtnState(btnCancel, true);
                        }
                    })
                    .catch(err => {
                        if (_taskData.id === undefined) {
                            toggleBtnState(btnCreate, false);
                            toggleBtnState(btnCancel, true);
                        }

                        logger('Poll data: (error) ' + err.message);
                    })
            },
            abort: function () {
                logger('Cancel operation: (abort) start');

                taskAbort.abort();

                if (_taskData.id) {
                    fetchInstance.fetch('/cancel?id=' + _taskData.id, {method: 'DELETE', mode: "cors",}, 10000,)
                        .then(res => res.json())
                        .then(res => {
                            logger('Cancel operation: (data) ' + JSON.stringify(res));
                            _taskData.id = undefined;

                            if (res && res.status === 'canceled') {
                                toggleBtnState(btnCreate, false);
                                toggleBtnState(btnCancel, true);

                                logger('Cancel operation: (abort) aborted');
                            }
                        })
                        .catch(err => {
                            _taskData.id = undefined;

                            toggleBtnState(btnCreate, false);
                            toggleBtnState(btnCancel, true);

                            logger('Cancel operation: (error) ' + err.message);
                        })
                } else {
                    toggleBtnState(btnCreate, false);
                    toggleBtnState(btnCancel, true);

                    logger('Cancel operation: (abort) aborted');
                }
            },
        }
    }
})();
