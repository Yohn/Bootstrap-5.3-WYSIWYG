export class WysiwygEditor {
	constructor(editorSelector, options = {}) {
		this.editor = document.querySelector(editorSelector);
		this.sourceView = document.querySelector('#sourceView');
		this.toolbar = document.querySelector(options.toolbar);
		this.fontSizes = ['8px', '9px', '10px', '11px', '12px', '14px', '15px', '16px', '18px', '20px', '24px', '30px', '32px', '36px', '48px'];
		this.fontSizeDefault = '12px';
		this.fontFamilies = ['Open Sans', 'Arial', 'Arial Black', 'Courier', 'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times', 'Times New Roman', 'Verdana'];
		this.fontFamilyDefault = 'Open Sans';
		this.colors = [
			'#000000', '#434343', '#666666', '#999999', '#b7b7b7',
			'#ffffff', '#f3f3f3', '#cccccc', '#d9d9d9', '#efefef',
			'#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00',
			'#ff00ff', '#9900ff', '#0000ff', '#4a86e8', '#00ffff',
			'#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3',
			'#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'
		];
		this.emojis = ['😀', '😂', '😊', '😍', '🤔', '😎', '😴', '😄', '🥰', '😇', '🤗', '🤭', '😅', '😂', '🤣'];
		this.symbols = ['©', '®', '™', '€', '£', '¥', '§', '¶', '†', '‡', '±', '¹', '²', '³', '¼', '½', '¾', '⁄', '¿', '·', '•', '°', '′', '″', '‴'];
		this.isSourceView = false;
		this.init();
	}

	init() {
		if (!this.editor || !this.toolbar) {
			console.error('Editor or toolbar not found');
			return;
		}
		this.initFontControls();
		this.initToolbarEvents();
		this.initEditorEvents();
		this.initClipboardHandlers();
		// Set default font size and family
		this.execCommand('fontSize', this.fontSizeDefault);
		this.execCommand('fontName', this.fontFamilyDefault);
	}

	initFontControls() {
		// Update font size select
		const fontSizeSelect = this.toolbar.querySelector('#fontSizeSelect');
		if (fontSizeSelect) {
			this.fontSizes.forEach(size => {
				const option = document.createElement('option');
				option.value = size;
				option.textContent = size;
				option.selected = size === this.fontSizeDefault;
				fontSizeSelect.appendChild(option);
			});
		}
		// Update font family select
		const fontFamilySelect = this.toolbar.querySelector('#fontFamilySelect');
		if (fontFamilySelect) {
			this.fontFamilies.forEach(font => {
				const option = document.createElement('option');
				option.value = font;
				option.textContent = font;
				option.style.fontFamily = font;
				option.selected = font === this.fontFamilyDefault;
				fontFamilySelect.appendChild(option);
			});
		}
		// Update heading select
		const headingSelect = this.toolbar.querySelector('#headingSelect');
		if (headingSelect) {
			headingSelect.addEventListener('change', (e) => {
				if (e.target.value) {
					this.execCommand('formatBlock', e.target.value);
				}
			});
		}
	}

	initToolbarEvents() {
		this.toolbar.querySelectorAll('[data-command]').forEach(button => {
			button.addEventListener('click', (e) => {
				e.preventDefault();
				const command = button.getAttribute('data-command');
				if (['cut', 'copy', 'paste'].includes(command)) {
					this.handleClipboardOperation(command);
				} else if (command === 'createLink') {
					this.createLink();
				} else if (command === 'insertImage') {
					this.insertImage();
				} else if (command === 'insertTable') {
					this.insertTable();
				} else if (command === 'insertEmoji') {
					this.showEmojiPicker();
				} else if (command === 'insertSymbol') {
					this.showSymbolPicker();
				} else if (command === 'toggleSource') {
					this.toggleSourceView();
				} else if (command === 'insertCircleList') {
					this.insertList('circle');
				} else if (command === 'insertSquareList') {
					this.insertList('square');
				} else if (command === 'insertColor') {
					this.showColorPicker();
				} else {
					this.execCommand(command);
				}
			});
		});
		// Font size change handler
		const fontSizeSelect = this.toolbar.querySelector('#fontSizeSelect');
		if (fontSizeSelect) {
			fontSizeSelect.addEventListener('change', (e) => {
				this.execCommand('fontSize', e.target.value);
			});
		}
		// Font family change handler
		const fontFamilySelect = this.toolbar.querySelector('#fontFamilySelect');
		if (fontFamilySelect) {
			fontFamilySelect.addEventListener('change', (e) => {
				this.execCommand('fontName', e.target.value);
			});
		}
	}

	insertList(style) {
		this.execCommand('insertUnorderedList');
		const selection = window.getSelection();
		const list = selection?.anchorNode.closest('ul');
		if (list) {
			list.style.listStyleType = style;
		}
	}

	insertTable() {
		const rows = prompt('Enter number of rows:', '3');
		const cols = prompt('Enter number of columns:', '3');

		if (rows && cols) {
			let table = '<table class="table table-bordered"><tbody>';

			// Create header row
			table += '<tr>';
			for (let j = 0; j < cols; j++) {
				table += '<th contenteditable="true">Header ' + (j + 1) + '</th>';
			}
			table += '</tr>';

			// Create data rows
			for (let i = 0; i < rows - 1; i++) {
				table += '<tr>';
				for (let j = 0; j < cols; j++) {
					table += '<td contenteditable="true">Cell ' + (i + 1) + ',' + (j + 1) + '</td>';
				}
				table += '</tr>';
			}

			table += '</tbody></table><p></p>';
			this.execCommand('insertHTML', table);
		}
	}

	toggleSourceView() {
		this.isSourceView = !this.isSourceView;

		if (this.isSourceView) {
			this.sourceView.value = this.editor.innerHTML;
			this.editor.classList.add('d-none');
			this.sourceView.classList.remove('d-none');
			this.disableToolbar(true);
		} else {
			this.editor.innerHTML = this.sourceView.value;
			this.sourceView.classList.add('d-none');
			this.editor.classList.remove('d-none');
			this.disableToolbar(false);
		}
	}

	disableToolbar(disabled) {
		this.toolbar.querySelectorAll('button, select').forEach(element => {
			if (element.closest('[data-command="toggleSource"]')) return;
			element.disabled = disabled;
		});
	}

	createLink() {
		const url = prompt('Enter URL:', 'http://');
		if (url) {
			this.execCommand('createLink', url);
		}
	}

	insertImage() {
		const url = prompt('Enter image URL:', 'http://');
		if (url) {
			this.execCommand('insertImage', url);
		}
	}

	useModal(title, callback){
		new iModal({dialogCentered:true});
	}

	showColorPicker() {
		const picker = document.createElement('div');
		picker.className = 'color-picker';
		this.colors.forEach(color => {
			const btn = document.createElement('button');
			btn.style.backgroundColor = color;
			btn.style.width = '20px';
			btn.style.height = '20px';
			btn.style.border = '1px solid #ccc';
			btn.style.margin = '2px';
			btn.addEventListener('click', (e) => {
				e.stopPropagation(); // Stop event propagation
				this.execCommand('foreColor', color);
				picker.remove();
			});
			picker.appendChild(btn);
		});

		const button = this.toolbar.querySelector('[data-command="insertColor"]');
		button.parentNode.appendChild(picker);

		// Close picker when clicking outside
		const closePicker = (e) => {
			this.closeOpenPickers(e, button);
			document.removeEventListener('click', closePicker);
		};
		document.addEventListener('click', closePicker);
	}

	showEmojiPicker() {
		const picker = document.createElement('div');
		picker.className = 'emoji-picker';
		this.emojis.forEach(emoji => {
			const btn = document.createElement('button');
			btn.textContent = emoji;
			btn.addEventListener('click', (e) => {
				e.stopPropagation(); // Stop event propagation
				this.execCommand('insertText', emoji);
				picker.remove();
			});
			picker.appendChild(btn);
		});

		const button = this.toolbar.querySelector('[data-command="insertEmoji"]');
		button.parentNode.appendChild(picker);

		// Close picker when clicking outside
		const closePicker = (e) => {
			this.closeOpenPickers(e, button);
			document.removeEventListener('click', closePicker);
		};
		document.addEventListener('click', closePicker);
	}

	showSymbolPicker() {
		const picker = document.createElement('div');
		picker.className = 'symbol-picker';
		this.symbols.forEach(symbol => {
			const btn = document.createElement('button');
			btn.textContent = symbol;
			btn.addEventListener('click', (e) => {
				e.stopPropagation(); // Stop event propagation
				this.execCommand('insertText', symbol);
				picker.remove();
			});
			picker.appendChild(btn);
		});

		const button = this.toolbar.querySelector('[data-command="insertSymbol"]');
		button.parentNode.appendChild(picker);

		// Close picker when clicking outside
		const closePicker = (e) => {
			this.closeOpenPickers(e, button);
			document.removeEventListener('click', closePicker);
		};
		document.addEventListener('click', closePicker);
	}

	closeOpenPickers(e, targetButton) {
		const pickers = document.querySelectorAll('.color-picker, .emoji-picker, .symbol-picker');
		pickers.forEach(picker => {
			if (!picker.contains(e.target) && e.target !== targetButton) {
				picker.remove();
			}
		});
	}

	async handleClipboardOperation(command) {
		try {
			switch (command) {
				case 'cut':
					if (document.getSelection().toString().length > 0) {
						await navigator.clipboard.writeText(document.getSelection().toString());
						document.execCommand('delete');
					}
					break;
				case 'copy':
					if (document.getSelection().toString().length > 0) {
						await navigator.clipboard.writeText(document.getSelection().toString());
					}
					break;
				case 'paste':
					const text = await navigator.clipboard.readText();
					document.execCommand('insertText', false, text);
					break;
			}
		} catch (err) {
			console.error('Clipboard operation failed:', err);
			document.execCommand(command);
		}
	}

	initEditorEvents() {
		this.editor.addEventListener('paste', (e) => {
			e.preventDefault();
			const text = e.clipboardData.getData('text/plain');
			document.execCommand('insertText', false, text);
		});
		this.editor.addEventListener('drop', (e) => {
			e.preventDefault();
			const text = e.dataTransfer.getData('text/plain');
			document.execCommand('insertText', false, text);
		});
		this.editor.addEventListener('keydown', (e) => {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key.toLowerCase()) {
					case 'z':
						e.preventDefault();
						this.execCommand(e.shiftKey ? 'redo' : 'undo');
						break;
					case 'y':
						e.preventDefault();
						this.execCommand('redo');
						break;
				}
			}

			if (e.key === 'Tab') {
				e.preventDefault();
				document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
			}
		});
	}

	initClipboardHandlers() {
		this.editor.addEventListener('keydown', (e) => {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key.toLowerCase()) {
					case 'x':
					case 'c':
					case 'v':
						if (!this.editor.contains(document.activeElement)) return;
						break;
				}
			}
		});
	}

	execCommand(command, value = null) {
		this.editor.focus();
		document.execCommand(command, false, value);
		this.updateToolbarState();
	}

	updateToolbarState() {
		this.toolbar.querySelectorAll('[data-command]').forEach(button => {
			const command = button.getAttribute('data-command');
			if (['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {
				if (document.queryCommandState(command)) {
					button.classList.add('active');
				} else {
					button.classList.remove('active');
				}
			}
		});
	}

	getContent() {
		return this.editor.innerHTML;
	}

	setContent(html) {
		this.editor.innerHTML = html;
	}
}