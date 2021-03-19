import { ActivityForm } from "./activityForm.mjs";
import { Net } from "./socket.mjs";

export class Tracker extends Application {
    isOpen = false;
    toggled = false;
    showToPlayers = true;
    trackerData = {};
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/pf2e-exploration-tracker/templates/tracker.html";
        options.popOut = false;
        return options;
    }

    getData() {
        return this.trackerData;
    }

    activityData() {
      let data = {};

      if (game.user.isGM) {
        data.playerList = this.trackerData.playerList;
      } else {
        let player = { _id: game.user.data._id, name: game.user.data.name };
        data.playerList = [player];
      }

      data.activities = this.trackerData.activities;
      return data;
    }

    activateListeners(html) {

      const trackerMove = '#tracker--move-handle';
      const trackerSetup = '#tracker-setup';
      const trackerActivityItem = '.activity-item';

      let form = new ActivityForm(JSON.stringify(this.activityData()));

      html.find(trackerSetup).click(ev => {
        ev.preventDefault();
        ev = ev || window.event;
        form.renderForm(this.activityData())
      });

      html.find(trackerActivityItem).click(ev => {
        ev.preventDefault();
        ev = ev || window.event;
        this.openActionFromPacks(ev.target.innerText);
      })

      html.find(trackerMove).mousedown(ev => {
        ev.preventDefault();
        ev = ev || window.event;

        dragElement(document.getElementById("tracker-container"));
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        function dragElement(elmnt) {
          elmnt.onmousedown = dragMouseDown;
          function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
          }
        
          function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.bottom = null
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            elmnt.style.position = 'fixed';
            elmnt.style.zIndex = 100;
          }
        
          function closeDragElement() {
            // stop moving when mouse button is released:
            elmnt.onmousedown = null;
            document.onmouseup = null;
            document.onmousemove = null;
            let xPos = (elmnt.offsetLeft - pos1) > window.innerWidth ? window.innerWidth-200 : (elmnt.offsetLeft - pos1);
            let yPos = (elmnt.offsetTop - pos2) > window.innerHeight-20 ? window.innerHeight-100 : (elmnt.offsetTop - pos2)
            xPos = xPos < 0 ? 0 : xPos;
            yPos = yPos < 0 ? 0 : yPos;
            if(xPos != (elmnt.offsetLeft - pos1) || yPos != (elmnt.offsetTop - pos2)){
              elmnt.style.top = (yPos) + "px";
              elmnt.style.left = (xPos) + "px";
            }
            console.log(`pf2e-exploration-tracker | Setting tracker position to x: ${xPos}px, y: ${yPos}px`);
            game.user.update({flags: {'eatracker':{ 'trackerPos': {top: yPos, left: xPos}}}});
          }
        }
      });

    }

    addTrackerBehaviour() {
      Net.onUpdateActivity((data) => {
        this.updateActivity(data);
      });
    }

    setPos() {
      let pos = this.getPos();
        return new Promise(resolve => {
            function check() {
            let elmnt = document.getElementById("tracker-container");
            if (elmnt) {
                elmnt.style.bottom = null;
                let xPos = (pos.left) > window.innerWidth ? window.innerWidth-200 : pos.left;
                let yPos = (pos.top) > window.innerHeight-20 ? window.innerHeight-100 : pos.top;
                elmnt.style.top = (yPos) + "px";
                elmnt.style.left = (xPos) + "px";
                elmnt.style.position = 'fixed';
                elmnt.style.zIndex = 100;
                resolve();
            } else {
                setTimeout(check, 30);
            }
        }
        check();
        });
    }

    getPlayerActivityFlag(playerName) {
      let playerData = game.users.getName(playerName);
      if (playerData.data.flags.eatracker && playerData.data.flags.eatracker.currentActivity) {
        return playerData.data.flags.eatracker.currentActivity;
      } else {
        return "None"
      }
    }

    loadPlayers() {
      this.trackerData.playerList = game.users.players.map((user) => { 
        return {
          _id: user.data._id,
          name: user.data.name,
          activity: this.getPlayerActivityFlag(user.data.name)
        }
      });
    }

    async loadActivities() {
      let actions = await game.packs.get("pf2e.actionspf2e").getContent();
      actions = actions.filter((action) => {
        let traitsArray = action.data.data.traits.value;
        return traitsArray.includes("exploration");
      })
      actions = actions.map((action) => {
        return {
          _id: action.data._id,
          name: action.data.name
        }
      })
      this.trackerData.activities = actions;
    }

    openTracker() {
      this.setPos();
    }

    getPos() {
      if (game.user.data.flags.eatracker && game.user.data.flags.eatracker.trackerPos) {
        return (game.user.data.flags.eatracker.trackerPos);
      } else {
        let yPos = "400";
        let xPos = "400";
        game.user.update({flags: {'eatracker':{ 'trackerPos': {top: yPos, left: xPos}}}})
        return {top: yPos, left: xPos}
      }
    }

    async updateActivity(data) {
      let playerData = game.users.getName(data.player);
      this.trackerData.playerList.find((player) => {return player.name === data.player}).activity = data.activity;
      playerData.update({flags: {'eatracker': { 'currentActivity' : data.activity}}});
      await this.render(true);
    }

    static toggleTracker(tracker){
        console.log('pf2e-exploration-tracker | Toggling tracker display.');
        let templatePath = "modules/pf2e-exploration-tracker/templates/tracker.html";
        if (tracker.toggled) {
          tracker.toggled = false;
          tracker.close();
        } else {
          tracker.toggled = true;
          renderTemplate(templatePath, tracker.trackerData).then(html => {
            tracker.render(true);
          }).then(() => {
            tracker.openTracker();
          });
        }
      }
}