import sys
import os
import uvicorn

# This line tells Python to look in the current directory for the 'app' module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app", 
        host="127.0.0.1", 
        port=8000, 
        reload=True,
        reload_dirs=["app"]  
    )