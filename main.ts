import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as flowchart from 'flowchart.js';

interface FlowchartPluginSettings {
	config: Record<string, any>;
}

const DEFAULT_SETTINGS: FlowchartPluginSettings = {
	config: {
		x: 0,
		y: 0,
		'line-width': 2,
		'line-length': 50,
		'text-margin': 10,
		'font-size': 14,
		'font-color': 'black',
		'line-color': 'black',
		'element-color': 'black',
		fill: 'white',
		'yes-text': 'yes',
		'no-text': 'no',
		'arrow-end': 'block',
		scale: 1,
		symbols: {
			start: {
				'font-color': 'black',
				'element-color': 'black',
				fill: 'white',
			},
			end: {
				'font-color': 'black',
				'element-color': 'black',
				fill: 'white',
			},
		},
	},
};

export default class FlowchartPlugin extends Plugin {
	settings: FlowchartPluginSettings;

	async onload() {
		await this.loadSettings();

		// Register the markdown post processor for 'flowchart' code blocks
		this.registerMarkdownCodeBlockProcessor('flowchart', (source, el, ctx) => {
			this.renderFlowchart(source, el);
		});

		this.addSettingTab(new FlowchartSettingTab(this.app, this));
	}

	renderFlowchart(source: string, el: HTMLElement) {
		// Wrap the rendering in a requestAnimationFrame for timing
		requestAnimationFrame(() => {
			try {
				const config = this.mergeSymbolSettings(this.settings.config);
				const diagram = flowchart.parse(source);
				const container = el.createEl('div', {
					cls: 'obsidian-flowchart-container',
				});
				diagram.drawSVG(container, config);
				container
					.querySelector('svg')
					?.setAttribute('aria-label', 'Flowchart diagram');

				// Apply a fix for deprecated xlink attributes
				this.fixXlinkAttributes(container);
			} catch (error) {
				el.createEl('div', {
					cls: 'error-message',
					text: 'Failed to render flowchart. Check your input.',
				});
			}
		});
	}

	private mergeSymbolSettings(
		config: Record<string, any>
	): Record<string, any> {
		// Ensure symbols inherit main settings if not explicitly defined
		const {
			'font-color': fontColor,
			'element-color': elementColor,
			fill,
		} = config;

		const mergedSymbols = {
			start: {
				'font-color': fontColor,
				'element-color': elementColor,
				fill: fill,
			},
			end: {
				'font-color': fontColor,
				'element-color': elementColor,
				fill: fill,
			},
		};

		return {
			...config,
			symbols: {
				...config.symbols,
				...mergedSymbols,
			},
		};
	}

	fixXlinkAttributes(el: HTMLElement) {
		// Find elements with deprecated xlink attributes and replace them
		const elements = el.querySelectorAll('[*|href]');
		elements.forEach((element) => {
			const xlinkHref = element.getAttribute('xlink:href');
			if (xlinkHref) {
				element.setAttribute('href', xlinkHref);
				element.removeAttribute('xlink:href');
			}
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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

		this.addThemeNotice(containerEl);

		this.addFlowchartSettings(containerEl);

		this.addResetButton(containerEl);
	}

	private addFlowchartSettings(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('Line width')
			.setDesc('Set the line width for the flowchart.')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.config['line-width'].toString())
					.onChange(async (value) => {
						this.plugin.settings.config['line-width'] = parseInt(value) || 2;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Line length')
			.setDesc('Set the line length for the flowchart.')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.config['line-length'].toString())
					.onChange(async (value) => {
						this.plugin.settings.config['line-length'] = parseInt(value) || 2;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Yes text')
			.setDesc('Text for "yes" responses in the flowchart.')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.config['yes-text'])
					.onChange(async (value) => {
						this.plugin.settings.config['yes-text'] = value || 'yes';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('No text')
			.setDesc('Text for "no" responses in the flowchart.')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.config['no-text'])
					.onChange(async (value) => {
						this.plugin.settings.config['no-text'] = value || 'no';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Font size')
			.setDesc('Set the font size for the flowchart.')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.config['font-size'].toString())
					.onChange(async (value) => {
						this.plugin.settings.config['font-size'] = parseInt(value) || 14;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Font color')
			.setDesc('Set the font color for the flowchart.')
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.config['font-color'])
					.onChange(async (value) => {
						this.plugin.settings.config['font-color'] = value || 'black';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Line color')
			.setDesc('Set the line color for the flowchart.')
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.config['line-color'])
					.onChange(async (value) => {
						this.plugin.settings.config['line-color'] = value || 'black';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Element color')
			.setDesc('Set the element color for the flowchart.')
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.config['element-color'])
					.onChange(async (value) => {
						this.plugin.settings.config['element-color'] = value || 'black';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Fill color')
			.setDesc('Set the background fill color for the flowchart.')
			.addColorPicker((picker) =>
				picker
					.setValue(this.plugin.settings.config['fill'])
					.onChange(async (value) => {
						this.plugin.settings.config['fill'] = value || 'white';
						await this.plugin.saveSettings();
					})
			);
	}

	private addResetButton(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('Reset settings')
			.setDesc('Reset all settings to their default values.')
			.addButton((button) =>
				button.setButtonText('Reset').onClick(async () => {
					this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}

	private addThemeNotice(containerEl: HTMLElement): void {
		const isDarkMode = document.body.classList.contains('theme-dark');
		const isLightMode = document.body.classList.contains('theme-light');
		let mode = '';

		if (isDarkMode) {
			mode = 'dark';
		} else if (isLightMode) {
			mode = 'light';
		}

		if (!mode) {
			return;
		}

		containerEl.createEl('div', {
			text: `You are in ${mode} mode. Adjust colors for better visibility!`,
			cls: 'theme-notice',
		});
	}
}
