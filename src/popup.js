import { h, render } from "preact";
import { setup } from "goober";
import { App } from "./App.jsx";

setup(h);

const root = document.getElementById("appRoot");

if (root) {
	// Make popup bootstrap idempotent if the same document initializes more than once.
	root.replaceChildren();
	render(h(App, null), root);
}
