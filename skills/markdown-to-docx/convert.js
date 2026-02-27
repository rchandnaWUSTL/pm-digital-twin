#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  WidthType,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  PageNumber,
  TabStopType,
  TabStopPosition,
  LevelFormat,
  convertInchesToTwip
} = require('docx');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node convert.js <markdown-file-path> [output-name]');
  process.exit(1);
}

const inputPath = args[0];
const outputName = args[1] || path.basename(inputPath, '.md') + '.docx';
const outputDir = path.join(process.cwd(), 'context', 'outputs');
const outputPath = path.join(outputDir, outputName);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`⚙️  markdown-to-docx — reading ${inputPath}...`);

// Read input file
let content;
try {
  content = fs.readFileSync(inputPath, 'utf8');
} catch (err) {
  console.error(`❌ File not found: ${inputPath}`);
  process.exit(1);
}

const lines = content.split('\n');
console.log(`   ✓ File loaded — ${lines.length} lines`);

// Strip YAML frontmatter
let contentStart = 0;
if (lines[0] === '---') {
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      contentStart = i + 1;
      break;
    }
  }
  console.log('   ✓ Frontmatter stripped');
}

const markdownContent = lines.slice(contentStart).join('\n');

// Extract document title (first H1)
const h1Match = markdownContent.match(/^#\s+(.+)$/m);
const documentTitle = h1Match ? h1Match[1] : 'Document';

console.log(`   ✓ Document structure parsed — title: "${documentTitle}"`);
console.log('');
console.log('⚙️  markdown-to-docx — building docx structure...');

// Parse markdown into sections
const sections = [];
let listCounter = 0;

function parseInlineFormatting(text) {
  const runs = [];
  let lastIndex = 0;

  // Parse bold, italic, and inline code
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, format: 'bold' },
    { regex: /__(.+?)__/g, format: 'bold' },
    { regex: /\*(.+?)\*/g, format: 'italic' },
    { regex: /_(.+?)_/g, format: 'italic' },
    { regex: /`(.+?)`/g, format: 'code' }
  ];

  // Simple implementation: just handle bold and italic
  let currentText = text;

  // Replace [[wikilinks]] with plain text
  currentText = currentText.replace(/\[\[(.+?)\]\]/g, '$1');

  // For simplicity, create a single run
  // A full implementation would parse all inline formatting
  const boldMatches = [...currentText.matchAll(/\*\*(.+?)\*\*/g)];
  const italicMatches = [...currentText.matchAll(/\*(.+?)\*/g)];

  if (boldMatches.length === 0 && italicMatches.length === 0) {
    return [new TextRun({ text: currentText })];
  }

  // Simple split on bold
  const parts = currentText.split(/(\*\*.*?\*\*)/g);
  return parts
    .filter(part => part.length > 0)
    .map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({ text: part.slice(2, -2), bold: true });
      }
      return new TextRun({ text: part });
    });
}

function createParagraphFromLine(line) {
  // Check for headings
  const h1Match = line.match(/^#\s+(.+)$/);
  const h2Match = line.match(/^##\s+(.+)$/);
  const h3Match = line.match(/^###\s+(.+)$/);

  if (h1Match) {
    return new Paragraph({
      text: h1Match[1],
      heading: HeadingLevel.HEADING_1,
      style: 'Heading1'
    });
  }

  if (h2Match) {
    return new Paragraph({
      text: h2Match[1],
      heading: HeadingLevel.HEADING_2,
      style: 'Heading2'
    });
  }

  if (h3Match) {
    return new Paragraph({
      text: h3Match[1],
      heading: HeadingLevel.HEADING_3,
      style: 'Heading3'
    });
  }

  // Check for blockquote
  if (line.startsWith('> ')) {
    return new Paragraph({
      children: [new TextRun({ text: line.slice(2), italics: true })],
      indent: { left: convertInchesToTwip(0.5) },
      border: {
        left: {
          style: BorderStyle.SINGLE,
          size: 12,
          color: 'CCCCCC'
        }
      }
    });
  }

  // Check for horizontal rule
  if (line === '---') {
    return new Paragraph({
      text: '',
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: 'CCCCCC'
        }
      }
    });
  }

  // Regular paragraph
  if (line.trim().length === 0) {
    return new Paragraph({ text: '' });
  }

  return new Paragraph({
    children: parseInlineFormatting(line),
    spacing: { after: 120 }
  });
}

// Parse tables
function parseTable(tableLines) {
  if (tableLines.length < 2) return null;

  const rows = [];

  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i];

    // Skip separator line
    if (line.match(/^\|[\s\-:]+\|$/)) continue;

    const cells = line.split('|').slice(1, -1).map(c => c.trim());

    const isHeader = i === 0;

    const tableCells = cells.map((cellText, idx) => {
      const cellWidth = Math.floor(9360 / cells.length);

      return new TableCell({
        width: { size: cellWidth, type: WidthType.DXA },
        shading: {
          type: ShadingType.CLEAR,
          fill: isHeader ? '2E4057' : (i % 2 === 0 ? 'F5F5F5' : 'FFFFFF')
        },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: cellText,
                bold: isHeader,
                color: isHeader ? 'FFFFFF' : '000000'
              })
            ]
          })
        ]
      });
    });

    rows.push(new TableRow({ children: tableCells }));
  }

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
    }
  });
}

// Simple markdown parsing
const contentLines = markdownContent.split('\n');
let i = 0;
let inTable = false;
let tableLines = [];
let paragraphCount = 0;
let tableCount = 0;

while (i < contentLines.length) {
  const line = contentLines[i];

  // Table detection
  if (line.startsWith('|')) {
    if (!inTable) {
      inTable = true;
      tableLines = [line];
    } else {
      tableLines.push(line);
    }
  } else {
    if (inTable) {
      // End of table
      const table = parseTable(tableLines);
      if (table) {
        sections.push(table);
        tableCount++;
      }
      inTable = false;
      tableLines = [];
    }

    // Regular line
    const para = createParagraphFromLine(line);
    sections.push(para);
    paragraphCount++;
  }

  i++;
}

// Handle trailing table
if (inTable && tableLines.length > 0) {
  const table = parseTable(tableLines);
  if (table) {
    sections.push(table);
    tableCount++;
  }
}

console.log(`   ✓ Header created`);
console.log(`   ✓ Content sections rendered — ${paragraphCount} paragraphs, ${tableCount} tables`);
console.log(`   ✓ Footer created`);
console.log('');

// Create document
const doc = new Document({
  styles: {
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        run: {
          size: 32,
          bold: true,
          color: '2E4057',
          font: 'Arial'
        },
        paragraph: {
          spacing: { before: 240, after: 120 },
          outlineLevel: 0
        }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        run: {
          size: 28,
          bold: true,
          color: '2E4057',
          font: 'Arial'
        },
        paragraph: {
          spacing: { before: 240, after: 120 },
          outlineLevel: 1
        }
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        run: {
          size: 24,
          bold: true,
          color: '666666',
          font: 'Arial'
        },
        paragraph: {
          spacing: { before: 240, after: 120 },
          outlineLevel: 2
        }
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          width: 12240,
          height: 15840,
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: documentTitle, bold: true, size: 36, color: '2E4057' })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '[COMPANY] Confidential', size: 20, color: '999999' })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 }
            }),
            new Paragraph({
              text: '',
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' }
              },
              spacing: { after: 240 }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: '[COMPANY] Internal', size: 18, color: '999999' }),
                new TextRun({ text: '\tPage ', size: 18, color: '999999' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '999999' })
              ],
              tabStops: [
                { type: TabStopType.RIGHT, position: TabStopPosition.MAX }
              ]
            })
          ]
        })
      },
      children: sections
    }
  ]
});

// Generate and save
console.log('⚙️  markdown-to-docx — generating file...');

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('');
  console.log(`✅ docx saved → ${outputPath}`);
  console.log('');
  console.log('⚠️  Note: Validation script not found. Manual validation recommended.');
}).catch(err => {
  console.error('❌ Error generating docx:', err);
  process.exit(1);
});
