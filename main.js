//import './style.css';
import { WysiwygEditor } from 'wysiwyg.js';

document.addEventListener('DOMContentLoaded', () => {
	const editor = new WysiwygEditor('#editor', {
		toolbar: '#toolbar'
	});
});