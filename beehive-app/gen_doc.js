const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, Header, AlignmentType } = require('docx');

const dirToScan = [
    path.join(__dirname, 'App.tsx'),
    path.join(__dirname, 'app.json'),
    path.join(__dirname, 'src')
];

function extractLinesFromText(text) {
    let inBlockComment = false;
    const lines = text.split('\n');
    const extracted = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        if (inBlockComment) {
            const endIdx = line.indexOf('*/');
            if (endIdx !== -1) {
                inBlockComment = false;
                line = line.substring(endIdx + 2).trim();
                if (line && !line.startsWith('//')) extracted.push(line);
            }
            continue;
        }

        if (line.startsWith('/*')) {
            const endIdx = line.indexOf('*/');
            if (endIdx !== -1) {
                line = line.substring(endIdx + 2).trim();
                if (line && !line.startsWith('//')) extracted.push(line);
            } else {
                inBlockComment = true;
            }
            continue;
        }

        if (line.startsWith('//')) {
            continue;
        }

        let originalLine = lines[i];
        originalLine = originalLine.replace(/\r/g, '').replace(/\t/g, '    ');
        if (originalLine.trim()) {
            extracted.push(originalLine);
        }
    }
    return extracted;
}

let allLines = [];
function scanDir(currentPath) {
    if (!fs.existsSync(currentPath)) return;
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
            scanDir(path.join(currentPath, file));
        }
    } else {
        if (currentPath.endsWith('.ts') || currentPath.endsWith('.tsx') || currentPath.endsWith('.js') || currentPath.endsWith('.json')) {
            const text = fs.readFileSync(currentPath, 'utf8');
            allLines.push(...extractLinesFromText(text));
        }
    }
}

dirToScan.forEach(scanDir);

console.log('Total valid lines found:', allLines.length);

let finalLines = [];
if (allLines.length > 3000) {
    finalLines = [...allLines.slice(0, 1500), ...allLines.slice(allLines.length - 1500)];
} else {
    finalLines = allLines;
}

const sections = [];

for (let i = 0; i < finalLines.length; i += 50) {
    const chunk = finalLines.slice(i, i + 50);

    sections.push({
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '软件名称：泱泱云合软件，版本号：V1.0',
                                size: 20
                            })
                        ],
                        alignment: AlignmentType.CENTER
                    })
                ]
            })
        },
        properties: {
            page: {
                margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
            }
        },
        children: chunk.map(line => new Paragraph({
            children: [new TextRun({ text: line, size: 20, font: 'Consolas' })],
            spacing: { line: 240 }
        }))
    });
}

const doc = new Document({
    sections: sections
});

const outPath = 'e:\\demo\\蜂巢\\泱泱云合软件_V1.0_代码文档.docx';
Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outPath, buffer);
    console.log('Done generating: ' + outPath);
}).catch(console.error);
