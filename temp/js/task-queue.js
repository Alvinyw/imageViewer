/*
 * master branch: https://github.com/Keillion/www.keillion.site Unlicense
 */
var TaskQueue = function(){
    /// <summary>
    /// @class TaskQueue
    /// </summary>

    this._queue = [];
    this.isWorking = false;

    /// <param name="timeout" type="int">
    /// Timeout between task.
    /// Between the interval, other work can be done, such as UI-response work.
    /// </param>
    this.timeout = 100;
};

TaskQueue.prototype.push = function(task, context, args){
    /// <summary>
    /// Push task. If <span>!isWorking</span>, start the task queue automatically.
    /// </summary>

    this._queue.push({
        "task": task,
        "context": context,
        "args": args
    });
    if(!this.isWorking){
        this.next();
    }
};

TaskQueue.prototype.unshift = function(task, context, args){
    /// <summary>
    /// Push task. If <span>!isWorking</span>, start the task queue automatically.
    /// </summary>

    this._queue.unshift({
        "task": task,
        "context": context,
        "args": args
    });
    if(!this.isWorking){
        this.next();
    }
};

TaskQueue.prototype.next = function(){
    /// <summary>
    /// Do the next task.
    /// You need to call it manually in the end of your task.
    /// To assure <function>next</function> will be called,
    /// in some case you can put the function in <span>finally</span>,
    /// in other case you should carefully handle <span>setTimeout</span>.
    /// </summary>

    if(this._queue.length == 0){
        this.isWorking = false;
        return;
    }
    this.isWorking = true;
    var item = this._queue.shift();
    var task = item.task;
    var taskContext = item.context ? item.context : self;
    var taskArguments = item.args ? item.args : [];
    setTimeout(function(){
        task.apply(taskContext, taskArguments);
    }, this.timeout);
};

/*
TaskQueue.test = function(){
    var taskQueue = new TaskQueue();
    var task = function(mess){
        console.log(mess);
        taskQueue.next();
    };
    for(var i = 0; i < 100; ++i){
        taskQueue.push(task, null, [i]);
    }
};*/