const lookupServices = ["Google", "Howard Knight"];
const DEFAULT_PREFERENCES = {
  selectedLookupService: lookupServices[0],
};

async function restore_options() {
  const menuList = document.getElementById("lookupServices");
  const prefs = await messenger.storage.local.get(DEFAULT_PREFERENCES);
  for (const lookupService of lookupServices) {
    const option = document.createElement("option");
    option.text = lookupService;
    option.selected = prefs["selectedLookupService"] == lookupService;
    menuList.add(option);
  }
}

function change_options(event) {
  let node = event.target;
  if (!node.id == "selectedLookupService") {
    return;
  }
  messenger.storage.local.set({
    selectedLookupService: lookupServices[node.selectedIndex],
  });
}

function setup_listeners() {
  document.body.addEventListener("change", change_options);
}

document.addEventListener("DOMContentLoaded", setup_listeners);
document.addEventListener("DOMContentLoaded", restore_options);
