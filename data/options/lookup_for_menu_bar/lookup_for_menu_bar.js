(async () => {
    'use strict'
    class Lookup {
        constructor() {
            this.localData = {};
            this.body = document.body;
            this.html = document.documentElement;

            this.panel;
            this.panelSelect = null;
            this.panelQueryFrom = null;
            this.panelQueryInput = null;
        }
        async getDataFromLocalStorage() {
            this.localData = await lookupUtility.localStorageDataPromise();
        }
        sourcesOptionsForSelect() {
            let options = '';
            this.localData.sources.forEach(function(source) {
                if (!source.isHidden) {
                    options += `<option data-url="${source.url.replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}">${source.title}</option>`
                }
            });
            return options;
        }

        createPanel() {
            this.panel = document.createElement("div");
            this.panel.insertAdjacentHTML("afterbegin", `
              <div class="panel-select-panel-input-container ">
                <select class="lookup-panel-select lookup-custom-select">${this.sourcesOptionsForSelect()}</select>
                <form class="lookup-form" title="Type your query and press Enter">
                  <input class="lookup-query-input" placeholder="Type your query and press Enter" autofocus>
                </form>
              </div>
            `);
            this.panel.classList.add("lookup-panel");
            this.panelSelect = this.panel.querySelector('.lookup-panel-select');
            this.panelQueryForm = this.panel.querySelector('.lookup-form');
            this.panelQueryInput = this.panel.querySelector('.lookup-query-input');
            this.panel.querySelector('.lookup-panel-select')
                .addEventListener('change', this.changeSource());
            this.body.appendChild(this.panel);
        }

        changeSource(e) {
            if (!this.panel) { return; }
            this.panelSelect.addEventListener("change", () => {
                let query = this.panelQueryInput.value.trim();
                if (!query) { return; }
                let selectedSource = this.panelSelect.options[this.panelSelect.selectedIndex];
                let selectedSourceUrl = selectedSource.dataset.url;
                let url = lookupUtility.createSourceUrlForNewWindow(selectedSourceUrl, query);
                chrome.runtime.sendMessage({
                    method: 'open-lookup-popup',
                    // url: encodeURIComponent(url)
                    url: url
                });
            });

        }
        changeQuery() {
            if (!this.panel) { return; }
            let queryOld = this.panelQueryInput.value.trim();

            this.panelQueryForm.addEventListener("submit", (e) => {
                e.preventDefault();
                let query = this.panelQueryInput.value.trim();
                if (query == "" || query === queryOld) { return; }

                let selectedSource = this.panelSelect.options[this.panelSelect.selectedIndex];
                let selectedSourceUrl = selectedSource.dataset.url;
                if (!selectedSourceUrl) {
                    selectedSourceUrl = this.selectedSource.dataset.url;
                }
                let url = lookupUtility.createSourceUrlForNewWindow(selectedSourceUrl, query);
                chrome.runtime.sendMessage({
                    method: 'open-lookup-popup',
                    // url: encodeURIComponent(url)
                    url: url
                });
            });
        }


    }

    let lookup = new Lookup();
    await lookup.getDataFromLocalStorage();


    lookup.createPanel();
    lookup.changeQuery();
})();