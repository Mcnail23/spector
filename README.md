# 👻 Spector

**Spector** is a modular, multi-language Command Line Interface (CLI) security toolkit designed for lightning-fast cloud asset reconnaissance and local repository secret scanning. 

By leveraging the unique strengths of different programming languages, Spector provides an optimized pipeline for modern offensive security testing and defensive auditing.

---

## 🏗️ Architecture Overview

Spector uses a modular design coordinated by a central routing core:

* **The Master Router (Bash):** A lightweight entry-point wrapper that parses arguments and handles core module execution cleanly using the *Unix Philosophy of Silence*.
* **S3 Sniper (Go Engine):** A hyper-fast, multi-threaded AWS S3 bucket enumerator that uses Go's concurrency primitives (**Goroutines**) to fire thousands of lightweight HTTP `HEAD` requests simultaneously.
* **Repo Haunter (Python Engine):** A targeted, regex-driven repository analysis engine built to scan code directories locally for exposed keys, tokens, and hardcoded credentials.
* **The Reporter (Node.js Engine):** A zero-dependency report engine that parses raw JSON outputs from the scanning modules and builds a clean, standalone dark-themed HTML security dashboard.

---

## 🚀 Prerequisites & Installation

Ensure you have the core language runtimes installed on your Linux environment (tested heavily on Kali Linux):

```bash
# Install Go (for S3 Sniper compiler)
sudo apt update && sudo apt install golang-go -y

# Python 3 and Node.js are typically pre-installed on Kali, but if needed:
sudo apt install python3 nodejs -y
Setup
Clone the repository (or navigate to your local working directory) and build the Go binary:

Bash


# Navigate to the Go engine directory
cd modules/s3-sniper/

# Initialize and compile the hyper-fast binary
go mod init spector/s3-sniper
go build -o s3-sniper main.go

# Return to root and ensure the core wrapper is executable
cd ../../
chmod +x spector
🛠️ Usage Instructions
Spector routes all modules natively through the primary entry point script.

1. Cloud Recon: S3 Sniper (Go)
Feed a base target string and a wordlist to hunt for publicly exposed or restricted AWS storage buckets.

Bash


./spector s3 --target <target-string> --wordlist <path-to-wordlist>
2. Secret Hunting: Repo Haunter (Python)
Scan a local code directory or repository clone for leaked strings and keys.

Bash


./spector github --target <path-to-local-directory>
3. Reporting Dashboard: Node.js Reporter
Transform raw JSON engine output into an executive HTML format.

Bash


./spector report --file <path-to-scan-results.json>
⛓️ Full Attack Chain Pipeline
Because Spector adheres strictly to clean Unix output piping, you can effortlessly chain data from the scanning engines directly into files and generate reports on the fly:

Bash


# 1. Run the concurrent Go scan and pipe output straight to a JSON file
./spector s3 --target targetcorp --wordlist ./wordlists/test-list.txt > outputs/scan.json

# 2. Parse the output JSON directly through the Node engine to build the HTML report
./spector report --file outputs/scan.json

# 3. View your elegant dark-mode dashboard
firefox outputs/spector-report.html
⚖️ Disclaimer
This tool is developed strictly for educational purposes, authorized security auditing, and defensive verification. Running reconnaissance or security tools against targets without explicit, prior written consent is illegal. The developer assumes no liability for misuse, unintended damage, or illegal activity conducted with this framework.
