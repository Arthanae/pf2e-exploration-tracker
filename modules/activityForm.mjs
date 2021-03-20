export class ActivityForm extends FormApplication {
    
    data = {};

    constructor(newData) {
        super();
        this.data = newData;
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
        html.find(submit).click((ev) => {
            ev.preventDefault();
            this.close();
            Hooks.callAll("eatrackerUpdateActivity",this.submitData());
        });
    }

    renderForm(_data) {
        this.data = _data;
        this.render(true);
    }
}