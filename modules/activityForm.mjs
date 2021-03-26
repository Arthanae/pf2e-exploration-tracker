export class ActivityForm extends FormApplication {
    
    data = {};
    actionPack = {};

    constructor(newData) {
        super();
        this.data = newData;
        game.packs.get("pf2e.actionspf2e").getContent().then(pack => this.actionPack = pack);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/pf2e-exploration-tracker/templates/activity-form.html";
        options.width = 600;
        options.height = "auto";
        options.title = "Modify Exploration Activities";
        return options;
    }

    getData() {
        return this.data;
    }

    submitData() {
        let submitData = {}
        submitData.player = document.getElementById("activity-form-player-select").value;
        submitData.activity = document.getElementById("activity-form-input").value;
        return submitData;
    }

    activateListeners(html) {
        const submit = "#activity-form-submit";
        const search = "#activity-form-input";
        html.find(submit).click((ev) => {
            ev.preventDefault();
            this.close();
            Hooks.callAll("eatrackerUpdateActivity",this.submitData());
        });

        html.find(search).change((ev) => {
            this.getActionPreview();
        });
    }

    getActionPreview() {
        let actionName = document.getElementById("activity-form-input").value;
        let actionPreview = this.actionPack.filter(action => action.data.name == actionName)[0];
        if (actionPreview) {
            document.getElementById("action-preview").innerHTML = actionPreview.data.data.description.value;
            this.setPosition(this.position);
        }
    }

    renderForm(_data) {
        this.data = _data;
        this.render(true);
    }
}