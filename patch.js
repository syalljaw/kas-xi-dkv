const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `                    </p>
                  </div>
                </div>
              </div>
          </>
        )}
      </div>
      {/* --- MODAL FORM DIALOGS --- */}`;

content = content.replace(/                    <\/p>\n                  <\/div>\n                <\/div>\n            \)}\n          <\/>\n        \)}\n      <\/div>\n      \{\/\* --- MODAL FORM DIALOGS --- \*\/\}/g, replacement);
fs.writeFileSync('src/App.tsx', content);
