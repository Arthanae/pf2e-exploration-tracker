import { Net } from "./modules/socket.mjs";
import { Tracker } from "./modules/tracker.mjs";

$(document).ready(() => {

    let tracker = new Tracker();

    Hooks.on('setup', () => {
        let operations = {
            toggleTracker: Tracker.toggleTracker,
        }
        game.EATracker = operations;
        window.EATracker = operations;
        tracker.addTrackerBehaviour();
    });

    Hooks.on('renderPlayerList', () => {
        tracker.loadPlayers();
        tracker.loadActivities();
    })

    Hooks.on("getSceneControlButtons", (controls) => {
        let notes = controls.find(control => control.name == 'notes')

        notes.tools.splice( notes.tools.length-1, 0, {
            name: "toggleTracker",
            title: "Toggle Exploration Activities Tracker",
            icon: "fas fa-search",
            onClick: () => { EATracker.toggleTracker(tracker); },
            button: true,
        });
    });

    Hooks.on("eatrackerUpdateActivity", (data) => {
        let playerData = game.users.getName(data.player);
        playerData.update({flags: {'eatracker': { 'currentActivity' : data.activity}}});
        tracker.updateActivity(data);
        Net.updateActivity(data);
    })

    Hooks.on("renderTracker", () => {
        tracker.setPos();
    })
})