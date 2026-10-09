const fs = require('fs');
const path = 'src/App.tsx';
let c = fs.readFileSync(path, 'utf8');

// Target the isolated Class dropdown specifically inside the customer form
const targetRegex = /<div className="field"><label>Class<\/label><select value=\{values\.className\} onChange=\{e=>set\('className',e\.target\.value\)\}>\{Array\.from\(\{length:12\},\(_,i\)=>\`Class \$\{i\+1\}\`\)\.map\(x=><option key=\{x\}>\{x\}<\/option>\)\}<\/select><\/div>/;

if (targetRegex.test(c)) {
  c = c.replace(targetRegex, '');
  fs.writeFileSync(path, c);
  console.log("Removed isolated Class dropdown successfully!");
} else {
  console.log("Target string not found.");
}
