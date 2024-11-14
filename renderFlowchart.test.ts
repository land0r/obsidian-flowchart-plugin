// Import the plugin and required types
import FlowchartPlugin from './main';
import { App, PluginManifest } from 'obsidian';

// Mock `obsidian` module
jest.mock('obsidian', () => ({
	App: jest.fn(),
	Plugin: jest.fn(),
	PluginSettingTab: jest.fn(),
	Setting: jest.fn(),
}));

// Helper function to extend global SVG methods
const setupGlobalSVGMocks = () => {
	Object.defineProperty(global.SVGSVGElement.prototype, 'createSVGMatrix', {
		writable: true,
		value: jest.fn().mockImplementation(() => ({
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			e: 0,
			f: 0,
			flipX: jest.fn().mockReturnValue(global.SVGSVGElement),
			flipY: jest.fn().mockReturnValue(global.SVGSVGElement),
			inverse: jest.fn().mockReturnValue(global.SVGSVGElement),
			multiply: jest.fn().mockReturnValue(global.SVGSVGElement),
			rotate: jest.fn().mockReturnValue(global.SVGSVGElement),
			rotateFromVector: jest.fn().mockReturnValue(global.SVGSVGElement),
			scale: jest.fn().mockReturnValue(global.SVGSVGElement),
			scaleNonUniform: jest.fn().mockReturnValue(global.SVGSVGElement),
			skewX: jest.fn().mockReturnValue(global.SVGSVGElement),
			skewY: jest.fn().mockReturnValue(global.SVGSVGElement),
			translate: jest.fn().mockReturnValue(global.SVGSVGElement),
		})),
	});

	Object.defineProperty(global.SVGSVGElement.prototype, 'createSVGPoint', {
		writable: true,
		value: jest.fn().mockImplementation(() => ({
			x: 0,
			y: 0,
			matrixTransform: jest.fn().mockReturnValue({
				x: 0,
				y: 0,
			}),
		})),
	});

	Object.defineProperty(global.SVGSVGElement.prototype, 'createSVGTransform', {
		writable: true,
		value: jest.fn().mockImplementation(() => ({
			angle: 0,
			matrix: {
				a: 1,
				b: 0,
				c: 0,
				d: 1,
				e: 0,
				f: 0,
				multiply: jest.fn(),
			},
			setMatrix: jest.fn(),
			setTranslate: jest.fn(),
		})),
	});
};

describe('Flowchart Plugin Tests', () => {
	// Setup before all tests
	beforeAll(() => {
		HTMLElement.prototype.createEl = function (
			tagName: string,
			options?: { cls?: string; text?: string }
		) {
			const el = document.createElement(tagName) as any;
			if (options?.cls) {
				el.className = options.cls;
			}
			if (options?.text) {
				el.textContent = options.text;
			}
			this.appendChild(el);
			return el;
		} as any;

		setupGlobalSVGMocks();
	});

	// Cleanup after all tests
	afterAll(() => {
		jest.useRealTimers();
	});

	// Define the test
	test('renders a valid flowchart', () => {
		// Mock the plugin's app and manifest objects
		const mockApp = { workspace: {} } as App;
		const mockManifest: PluginManifest = {
			id: 'flowchart-plugin',
			name: 'Flowchart Plugin',
			version: '1.0.0',
			author: 'land0r',
			description: 'A plugin for rendering flowcharts using flowchart.js',
			minAppVersion: '0.9.0',
		};

		// Create an instance of the plugin
		const plugin = new FlowchartPlugin(mockApp, mockManifest);

		// Mock the plugin's settings
		plugin.settings = {
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

		// Create a container element for the flowchart
		const el = document.createElement('div');
		const source =
			'```flowchart\n' +
			'st=>start: Start:>http://www.google.com[blank]\n' +
			'e=>end:>http://www.google.com\n' +
			'op1=>operation: My Operation\n' +
			'sub1=>subroutine: My Subroutine\n' +
			'cond=>condition: Yes\n' +
			'or No?:>http://www.google.com\n' +
			'io=>inputoutput: catch something...\n' +
			'para=>parallel: parallel tasks\n' +
			'in=>input: some in\n' +
			'out=>output: some out\n' +
			'\n' +
			'st->op1->cond\n' +
			'cond(yes)->io->e\n' +
			'cond(no)->para\n' +
			'para(path1, bottom)->sub1(right)->op1\n' +
			'para(path2, top)->op1\n' +
			'para(path3, right)->in->out->e' +
			'```\n';

		// Call the renderFlowchart method using `plugin`
		expect(() => plugin.renderFlowchart(source, el)).not.toThrow();

		jest.advanceTimersByTime(16);

		// Verify that the flowchart rendered an SVG
		expect(el.querySelector('svg')).toBeTruthy();
	});
});
