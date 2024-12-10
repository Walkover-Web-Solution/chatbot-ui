const fs = require('fs-extra');

(async function build() {
    await fs.copy('./demo.html', './dist/chat-widget/demo.html');
    await fs.copy('./dist/chat-widget/main.js', './dist/chat-widget/chat-widget.js');
    console.info('Elements created successfully!');
})();
