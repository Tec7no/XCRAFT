
import json
import subprocess
import os

try:
    # Run absolute path to npm if needed, but basic should work
    # On Windows, shell=True is needed for 'npm' command
    result = subprocess.run(['npm', 'run', 'lint', '--', '--format', 'json'], 
                          capture_output=True, text=True, shell=True, encoding='utf-8', errors='replace')
    
    # stdout might be empty if it failed, check stdout
    output = result.stdout
    
    if not output.strip():
        print("No output from eslint.")
        # Sometimes error output goes to stderr?
        print("Stderr:", result.stderr)
        exit(1)

    # Find the start of JSON array
    start_idx = output.find('[')
    if start_idx == -1:
         print("Could not find JSON start")
         print(output[:200])
         exit(1)
         
    json_str = output[start_idx:]
    data = json.loads(json_str)
    
    for file_result in data:
        file_path = file_result.get('filePath', 'unknown')
        messages = file_result.get('messages', [])
        if messages:
             print(f"\nFile: {file_path}")
             for msg in messages:
                 print(f"  Line {msg.get('line')}:{msg.get('column')} - {msg.get('message')} ({msg.get('ruleId')})")

except Exception as e:
    print(f"Error: {e}")
