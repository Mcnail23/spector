const fs = require('fs');
const path = require('path');

// Parse command line arguments to find the input file
const args = process.argv.slice(2);
const fileArgIndex = args.indexOf('--file');

if (fileArgIndex === -1 || !args[fileArgIndex + 1]) {
    console.error("[-] Please provide a JSON results file using --file");
    process.exit(1);
}

const inputFile = args[fileArgIndex + 1];
// Output the final report into our designated outputs folder
const outputFile = path.join(__dirname, '../../outputs/spector-report.html');

try {
    // Read and parse the JSON data
    const rawData = fs.readFileSync(inputFile, 'utf-8');
    const data = JSON.parse(rawData);

    // Build the HTML template (Dark Theme)
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Spector Security Report</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #e0e0e0; padding: 30px; }
            h1 { color: #00ffcc; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .card { background-color: #1e1e1e; padding: 20px; margin-bottom: 15px; border-radius: 8px; border-left: 5px solid #444; }
            .card.vuln { border-left-color: #ff4c4c; }
            .card.safe { border-left-color: #00cc66; }
            .vuln-text { color: #ff4c4c; font-weight: bold; }
            .safe-text { color: #00cc66; font-weight: bold; }
            a { color: #00aaff; text-decoration: none; }
            a:hover { text-decoration: underline; }
            code { background-color: #000; padding: 4px 8px; border-radius: 4px; color: #ffb86c; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <h1>👻 Spector Scan Report</h1>
        <p><strong>Target:</strong> ${data.target}</p>
        <h2>Scan Findings:</h2>
    `;

    if (data.results && data.results.length > 0) {
        data.results.forEach(res => {
            // Handle Go (S3 Engine) Output
            if (res.bucket) {
                const isVuln = res.status.includes('200');
                html += `
                <div class="card ${isVuln ? 'vuln' : 'safe'}">
                    <p><strong>S3 Bucket:</strong> ${res.bucket}</p>
                    <p><strong>Endpoint:</strong> <a href="${res.url}" target="_blank">${res.url}</a></p>
                    <p><strong>Access Status:</strong> <span class="${isVuln ? 'vuln-text' : 'safe-text'}">${res.status}</span></p>
                </div>`;
            }
            // Handle Python (GitHub Engine) Output
            else if (res.file) {
                html += `
                <div class="card vuln">
                    <p><strong>File Scanned:</strong> ${res.file}</p>
                    <ul>`;
                res.secrets.forEach(sec => {
                     html += `<li><span class="vuln-text">[!] ${sec.type}</span> at line ${sec.line}: <br><br><code>${sec.snippet}</code></li><br>`;
                });
                html += `</ul></div>`;
            }
        });
    } else {
        html += `<div class="card"><p>No vulnerabilities or secrets found. The target looks clean!</p></div>`;
    }

    html += `</body></html>`;

    // Write the final HTML file
    fs.writeFileSync(outputFile, html);
    console.log(`[+] Success! Report generated at: ${outputFile}`);

} catch (err) {
    console.error("[-] Error generating report. Make sure the JSON file is valid.");
    console.error(err.message);
}
