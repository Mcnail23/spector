import argparse
import os
import re
import json

# Define basic regex patterns to hunt for
# Note: These are simplified, educational patterns for demonstration.
PATTERNS = {
    "Generic Password": r"(?i)(?:password|passwd|pwd)[\s:=]+[\"']([^\"']+)[\"']",
    "Generic API Key": r"(?i)(?:api_key|apikey|secret)[\s:=]+[\"']([a-zA-Z0-9_\-]+)[\"']"
}

def scan_file(filepath):
    """Scans a single file for defined regex patterns."""
    findings = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            for line_num, line in enumerate(lines, 1):
                for key, pattern in PATTERNS.items():
                    matches = re.findall(pattern, line)
                    if matches:
                        findings.append({
                            "type": key,
                            "line": line_num,
                            "snippet": line.strip()[:50] + "..." # Truncate for safety
                        })
    except Exception as e:
        pass # Ignore unreadable files for this basic mockup
    return findings

def main():
    # Setup argument parsing to catch flags from the Bash wrapper
    parser = argparse.ArgumentParser(description="Spector Repo Haunter")
    parser.add_argument("--target", required=True, help="Target directory to scan")
    args = parser.parse_args()

    target_dir = args.target
    report_data = {"target": target_dir, "results": []}

    if not os.path.isdir(target_dir):
        print(json.dumps({"error": f"Directory {target_dir} not found."}))
        return

    # Walk through the directory and scan files
    for root, _, files in os.walk(target_dir):
        for file in files:
            filepath = os.path.join(root, file)
            # Skip hidden files and git directories for speed
            if ".git" in filepath: continue 
            
            file_findings = scan_file(filepath)
            if file_findings:
                report_data["results"].append({
                    "file": filepath,
                    "secrets": file_findings
                })

    # Output pure JSON so the Node.js module can parse it later
    print(json.dumps(report_data, indent=4))

if __name__ == "__main__":
    main()
