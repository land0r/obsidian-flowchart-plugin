import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import * as flowchart from "flowchart.js";

interface FlowchartPluginSettings {
	config: Record<string, any>;
}

const DEFAULT_SETTINGS: FlowchartPluginSettings = {
	config: {
		x: 0,
		y: 0,
		"line-width": 2,
		"line-length": 50,
		"text-margin": 10,
		"font-size": 14,
		"font-color": "black",
		"line-color": "black",
		"element-color": "black",
		fill: "white",
		"yes-text": "yes",
		"no-text": "no",
		"arrow-end": "block",
		scale: 1,
		symbols: {
			start: {
				"font-color": "black",
				"element-color": "black",
				fill: "white",
			},
			end: {
				"font-color": "black",
				"element-color": "black",
				fill: "white",
			},
		},
	},
};

export default class FlowchartPlugin extends Plugin {
	settings: FlowchartPluginSettings;

	async onload() {
		await this.loadSettings();

		console.log("Flowchart plugin loaded");

		// Register the markdown post processor for 'flowchart' code blocks
		this.registerMarkdownCodeBlockProcessor(
			"flowchart",
			(source, el, ctx) => {
				this.renderFlowchart(source, el);
			},
		);

		this.addSettingTab(new FlowchartSettingTab(this.app, this));
	}

	renderFlowchart(source: string, el: HTMLElement) {
		// Wrap the rendering in a requestAnimationFrame for timing
		requestAnimationFrame(() => {
			try {
				const diagram = flowchart.parse(source);
				const container = el.createEl("div", {
					cls: "obsidian-flowchart-container",
				});
				diagram.drawSVG(container, this.settings.config);

				// Apply a fix for deprecated xlink attributes
				this.fixXlinkAttributes(container);
			} catch (error) {
				console.error("Error rendering flowchart: ", error);
				el.createEl("div", {
					text: "Error rendering flowchart. Check your markup.",
				});
			}
		});
	}

	fixXlinkAttributes(el: HTMLElement) {
		// Find elements with deprecated xlink attributes and replace them
		const elements = el.querySelectorAll("[*|href]");
		elements.forEach((element) => {
			const xlinkHref = element.getAttribute("xlink:href");
			if (xlinkHref) {
				element.setAttribute("href", xlinkHref);
				element.removeAttribute("xlink:href");
			}
		});
	}

	onunload() {
		console.log("Flowchart plugin unloaded");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class FlowchartSettingTab extends PluginSettingTab {
	plugin: FlowchartPlugin;

	constructor(app: App, plugin: FlowchartPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Flowchart Plugin Settings" });

		new Setting(containerEl)
			.setName("Line Width")
			.setDesc("Set the line width for the flowchart.")
			.addText((text) =>
				text
					.setValue(
						this.plugin.settings.config["line-width"].toString(),
					)
					.onChange(async (value) => {
						this.plugin.settings.config["line-width"] =
							parseInt(value) || 2;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Line Length")
			.setDesc("Set the line length for the flowchart.")
			.addText((text) =>
				text
					.setValue(
						this.plugin.settings.config["line-length"].toString(),
					)
					.onChange(async (value) => {
						this.plugin.settings.config["line-length"] =
							parseInt(value) || 2;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Yes Text")
			.setDesc("Text for Yes responses in the flowchart.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.config["yes-text"])
					.onChange(async (value) => {
						this.plugin.settings.config["yes-text"] =
							value || "yes";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("No Text")
			.setDesc("Text for No responses in the flowchart.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.config["no-text"])
					.onChange(async (value) => {
						this.plugin.settings.config["no-text"] = value || "no";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Font Size")
			.setDesc("Set the font size for the flowchart.")
			.addText((text) =>
				text
					.setValue(
						this.plugin.settings.config["font-size"].toString(),
					)
					.onChange(async (value) => {
						this.plugin.settings.config["font-size"] =
							parseInt(value) || 14;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Font Color")
			.setDesc("Set the font color for the flowchart.")
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.config["font-color"])
					.onChange(async (value) => {
						this.plugin.settings.config["font-color"] =
							value || "black";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Line Color")
			.setDesc("Set the line color for the flowchart.")
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.config["line-color"])
					.onChange(async (value) => {
						this.plugin.settings.config["line-color"] =
							value || "black";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Element Color")
			.setDesc("Set the element color for the flowchart.")
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.config["element-color"])
					.onChange(async (value) => {
						this.plugin.settings.config["element-color"] =
							value || "black";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Fill Color")
			.setDesc("Set the background fill color for the flowchart.")
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.config["fill"])
					.onChange(async (value) => {
						this.plugin.settings.config["fill"] = value || "white";
						await this.plugin.saveSettings();
					}),
			);
	}
}
