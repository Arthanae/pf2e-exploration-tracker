export class Net {
    static get SOCKET_NAME() {
        return 'module.pf2e-exploration-tracker';
    }

    static _emit(...args) {
        game.socket.emit(Net.SOCKET_NAME, ...args)
    }

    static updateActivity(data) {
        Net._emit({
            cmd: 'updateActivity',
            player: data.player,
            activity : data.activity
        });
    }

    static onUpdateActivity(func) {
        game.socket.on(Net.SOCKET_NAME, (data) => {
            if(data.cmd !== 'updateActivity') return;
            func(data)
        })
    }
}