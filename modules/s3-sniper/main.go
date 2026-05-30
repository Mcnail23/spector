package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
)

// Data structures for our JSON output
type Result struct {
	BucketName string `json:"bucket"`
	URL        string `json:"url"`
	Status     string `json:"status"`
}

type Report struct {
	Target  string   `json:"target"`
	Results []Result `json:"results"`
}

// The worker function that runs concurrently
func checkBucket(target string, word string, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()

	word = strings.TrimSpace(word)
	if word == "" {
		return
	}
	
	bucketName := fmt.Sprintf("%s-%s", target, word)
	url := fmt.Sprintf("https://%s.s3.amazonaws.com", bucketName)

	resp, err := http.Head(url)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		results <- Result{BucketName: bucketName, URL: url, Status: "Exposed (200 OK)"}
	} else if resp.StatusCode == 403 {
		results <- Result{BucketName: bucketName, URL: url, Status: "Secured (403 Forbidden)"}
	}
}

func main() {
	targetPtr := flag.String("target", "", "Base target name")
	wordlistPtr := flag.String("wordlist", "", "Path to wordlist")
	flag.Parse()

	if *targetPtr == "" || *wordlistPtr == "" {
		fmt.Println(`{"error": "Missing target or wordlist"}`)
		return
	}

	file, err := os.Open(*wordlistPtr)
	if err != nil {
		fmt.Printf(`{"error": "Could not open wordlist: %s"}`+"\n", err)
		return
	}
	defer file.Close()

	var wg sync.WaitGroup
	resultsChan := make(chan Result, 1000)
	var finalResults []Result

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		word := scanner.Text()
		wg.Add(1)
		go checkBucket(*targetPtr, word, resultsChan, &wg)
	}

	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	for res := range resultsChan {
		finalResults = append(finalResults, res)
	}

	report := Report{Target: *targetPtr, Results: finalResults}
	jsonData, _ := json.MarshalIndent(report, "", "    ")
	fmt.Println(string(jsonData))
}
