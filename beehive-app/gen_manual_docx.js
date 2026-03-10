const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } = require('docx');

const mdPath = 'e:\\demo\\蜂巢\\泱泱云合软件_使用说明书.md';
const docxPath = 'e:\\demo\\蜂巢\\泱泱云合软件_使用说明书.docx';

// The generated artifact images
const imgPaths = {
    '1': 'C:\\Users\\86138\\.gemini\\antigravity\\brain\\a7a2eca5-1b4e-482e-bde8-aba3a4e3a457\\app_login_screen_1772270370968.png',
    '2': 'C:\\Users\\86138\\.gemini\\antigravity\\brain\\a7a2eca5-1b4e-482e-bde8-aba3a4e3a457\\app_create_project_screen_2_1772270436403.png',
    '3': 'C:\\Users\\86138\\.gemini\\antigravity\\brain\\a7a2eca5-1b4e-482e-bde8-aba3a4e3a457\\app_task_hall_screen_1772270390155.png',
    '4': 'C:\\Users\\86138\\.gemini\\antigravity\\brain\\a7a2eca5-1b4e-482e-bde8-aba3a4e3a457\\app_dashboard_screen_1772270407887.png'
};

if (!fs.existsSync(mdPath)) {
    console.error('Markdown file not found:', mdPath);
    process.exit(1);
}

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

const children = [];

lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('# ')) {
        children.push(new Paragraph({
            text: trimmed.replace('# ', ''),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 }
        }));
    } else if (trimmed.startsWith('## ')) {
        children.push(new Paragraph({
            text: trimmed.replace('## ', ''),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 }
        }));
    } else if (trimmed.startsWith('### ')) {
        children.push(new Paragraph({
            text: trimmed.replace('### ', ''),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
        }));
    } else if (trimmed.match(/\*\*\[截图占位符\s*(\d+)/)) {
        const match = trimmed.match(/\*\*\[截图占位符\s*(\d+)/);
        let matchedId = match ? match[1] : null;

        if (matchedId && fs.existsSync(imgPaths[matchedId])) {
            children.push(new Paragraph({
                children: [
                    new ImageRun({
                        data: fs.readFileSync(imgPaths[matchedId]),
                        transformation: {
                            width: 300,
                            height: 600
                        },
                        type: 'png'
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 }
            }));
        } else {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: trimmed + ' (图片未生成或丢失: ' + (matchedId ? imgPaths[matchedId] : 'unknown') + ')',
                        bold: true,
                        color: "FF0000",
                    })
                ],
                spacing: { before: 200, after: 100 }
            }));
        }
    } else if (trimmed.startsWith('> ')) {
        children.push(new Paragraph({
            children: [
                new TextRun({
                    text: trimmed.replace('> ', ''),
                    italics: true,
                    color: "666666"
                })
            ],
            spacing: { before: 100, after: 100 },
            indent: { left: 720 }
        }));
    } else {
        children.push(new Paragraph({
            children: [
                new TextRun({
                    text: trimmed.replace(/\*\*/g, ''),
                })
            ],
            spacing: { before: 120, after: 120 }
        }));
    }
});

const doc = new Document({
    sections: [{
        properties: {},
        children: children
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(docxPath, buffer);
    console.log('Word document generated at:', docxPath);
});
