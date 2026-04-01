const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/shared/EnterpriseCRM.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Remove bad inline styles
code = code.replace(/fontFamily:\s*'[^']+'/g, '');
code = code.replace(/style=\{\{.*?\}\}/g, '');
code = code.replace(/style=\{\{\s*\}\}/g, '');
code = code.replace(/font-sans\s+font-inter/g, 'antialiased font-sans');

// 2. We need to restructure the Tabs Navigation
const startBanner = '        {/* Component Description Banner */}';
const endTabs = '      {/* Localisation Indicator - Clean Professional */}';

const startIndex = code.indexOf(startBanner);
const endIndex = code.indexOf(endTabs);

if (startIndex !== -1 && endIndex !== -1) {
  // Remove the old Component Banner and Tabs from the header entirely
  const beforeHeader = code.substring(0, startIndex);
  const afterHeader = code.substring(endIndex);

  // We need to find the opening of the main wrapper
  // `<div className="crm-theme w-full bg-white rounded-xl shadow-lg overflow-hidden border border-[#C3A35E]/30 font-sans font-inter"`
  
  let newCode = beforeHeader.replace(
    /className="crm-theme w-full bg-white rounded-xl shadow-lg overflow-hidden border border-\[#C3A35E\]\/30 font-sans font-inter"/,
    'className="crm-theme flex w-full bg-[#f8fafc] overflow-hidden antialiased font-sans min-h-[90vh] text-slate-900 shadow-2xl rounded-2xl border border-black/5"'
  );
  
  // Close the old header div because we removed the end of it
  newCode += `      </div>\n`; // This closes the 'bg-white border-b' header

  // Add the new Apple-esque glassmorphic sidebar and content wrapper
  newCode += `
      {/* Sidebar Navigation - Glassmorphic Apple-esque */}
      <div className="flex flex-col md:flex-row w-full flex-1 min-h-[800px] bg-[#f8fafc]">
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 bg-white/80 backdrop-blur-xl border-r border-black/5 p-4 flex flex-col gap-2 z-20 sticky top-0 h-[100vh] overflow-y-auto hidden md:flex">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Modules</div>
          <div className="flex flex-col gap-1">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab);
                  const crmContainer = e.currentTarget.closest('.crm-theme');
                  if (crmContainer) {
                    crmContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={\`group relative flex items-center gap-3 px-4 py-3 transition-all duration-300 ease-in-out whitespace-nowrap rounded-xl \${
                  activeTab === tab
                    ? 'text-black bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] font-medium border border-black/5'
                    : 'text-slate-500 hover:text-black hover:bg-black/5 font-medium border border-transparent'
                }\`}
              >
                <span className={\`text-lg transition-transform duration-300 \${activeTab === tab ? 'scale-110' : 'group-hover:scale-110'}\`}>
                  {tabIcons[tab]}
                </span>
                <span className="text-sm capitalize font-medium">
                  {t(\`tabs.\${tab}\`)}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-auto pt-6 px-4">
             <div className="bg-gradient-to-br from-slate-100 to-white border border-slate-200 p-4 rounded-xl shadow-sm text-center">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-xs font-medium text-slate-800">Harvics OS Enterprise</div>
                <div className="text-[10px] text-slate-500 mt-1">v2.0 Beta</div>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]/50">
  `;
  
  newCode += afterHeader;
  
  // We need to add the closing tags at the very end.
  newCode = newCode.replace(
    `          </div>
        )}
      </div>
    </div>
  )
}`,
    `          </div>
        )}
      </div>
        </main>
      </div>
    </div>
  )
}`
  );

  // General theme replacements
  newCode = newCode.replace(/border-\[#C3A35E\]\/30/g, 'border-black/5');
  newCode = newCode.replace(/border-\[#C3A35E\]\/20/g, 'border-black/5');
  newCode = newCode.replace(/bg-\[#C3A35E\]\/5/g, 'bg-slate-50');
  newCode = newCode.replace(/text-\[#6B1F2B\]/g, 'text-slate-900');
  newCode = newCode.replace(/bg-\[#6B1F2B\]/g, 'bg-slate-900');
  newCode = newCode.replace(/hover:bg-\[#50000b\]/g, 'hover:bg-slate-800');
  newCode = newCode.replace(/text-\[#C3A35E\]/g, 'text-blue-600');
  
  fs.writeFileSync(filePath, newCode);
  console.log('Successfully updated EnterpriseCRM.tsx layout to Apple-esque Sidebar.');
} else {
  console.error('Could not find start/end marks.');
}
