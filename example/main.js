(function () {
  var enhancedFetchLogger = function (divWrapper) {
    return function (message) {
      if (divWrapper) {
        var div = document.createElement('div');
        div.innerHTML = message;

        divWrapper.append(div);
        divWrapper.scrollTop = log.scrollHeight;
      }
    }
  };

  var toggleBtnDisable = function (btn, disabled) {
    if (btn) {
      btn.disabled = disabled;
    }
  };

  var logWrapper = document.getElementById('log');
  var operationLogger = enhancedFetchLogger(logWrapper);

  if (!window['enhancedFetch']) {
    operationLogger('"enhancedFetch" is not defined in window scope');

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
        operationLogger('===========================');

        toggleBtnDisable(btnCreate, true);
        toggleBtnDisable(btnCancel, false);

        fetchInstance.fetch('/post', {
          signal: taskAbort.requestCreate.signal,
          method: 'POST',
          mode: "cors",
        }, 10000,)
          .then(res => res.json())
          .then(res => {
            operationLogger('Create operation: (data) ' + JSON.stringify(res));

            if (res && res.id) {
              toggleBtnDisable(btnCreate, true);
              toggleBtnDisable(btnCancel, false);

              _taskData.id = res.id;

              this.poll(_taskData.id);
            }
          })
          .catch(err => {
            toggleBtnDisable(btnCreate, false);
            toggleBtnDisable(btnCancel, true);

            operationLogger('Create operation: (error) ' + err.message);
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
            operationLogger('Poll data: (data) ' + JSON.stringify(res));

            if (res && res.status === 'processing') {
              context.poll(id, btnCreate, btnCancel);
            }

            if (res && res.status === 'done') {
              toggleBtnDisable(btnCreate, false);
              toggleBtnDisable(btnCancel, true);
            }

            if (res && res.status === 'error') {
              toggleBtnDisable(btnCreate, false);
              toggleBtnDisable(btnCancel, true);
            }
          })
          .catch(err => {
            if (_taskData.id === undefined) {
              toggleBtnDisable(btnCreate, false);
              toggleBtnDisable(btnCancel, true);
            }

            operationLogger('Poll data: (error) ' + err.message);
          })
      },
      abort: function () {
        operationLogger('Cancel operation: (abort) start');

        taskAbort.abort();

        if (_taskData.id) {
          fetchInstance.fetch('/cancel?id=' + _taskData.id, {method: 'DELETE', mode: "cors",}, 10000,)
            .then(res => res.json())
            .then(res => {
              operationLogger('Cancel operation: (data) ' + JSON.stringify(res));
              _taskData.id = undefined;

              if (res && res.status === 'canceled') {
                toggleBtnDisable(btnCreate, false);
                toggleBtnDisable(btnCancel, true);

                operationLogger('Cancel operation: (abort) aborted');
              }
            })
            .catch(err => {
              _taskData.id = undefined;

              toggleBtnDisable(btnCreate, false);
              toggleBtnDisable(btnCancel, true);

              operationLogger('Cancel operation: (error) ' + err.message);
            })
        } else {
          toggleBtnDisable(btnCreate, false);
          toggleBtnDisable(btnCancel, true);

          operationLogger('Cancel operation: (abort) aborted');
        }
      },
    }
  }
})();
