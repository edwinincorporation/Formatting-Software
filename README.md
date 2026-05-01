## Formatting Studio 

A full-stack web application that allows users to upload documents and automatically format them based on predefined rules. This tool is designed to simplify document formatting workflows using a combination of React (frontend), Node.js (backend), and Python processing scripts.

- Features
- Upload documents (e.g., .docx)
- Automatic formatting using Python scripts
- Download formatted output files
- Clean and responsive UI
- Real-time processing via backend API
- File handling (uploads & outputs management)
- Tech Stack
```
    >>Frontend:
        - React.js
        - Tailwind
        - Vite
    >>Backend:
        - Node.js
        - Express.js
        - python (formatter.py)
```

### Project Structure
```
formatting_tool/
│
├── client/          # React frontend
│   ├── src/
│   ├── public/
│
├── server/          # Node backend
│   ├── uploads/     # Uploaded files (ignored in git)
│   ├── outputs/     # Generated files (ignored in git)
│   ├── formatter.py # Python formatting logic
│   ├── index.js     # Server entry point
│
└── README.md
```

### Installation & Setup

1️⃣ Clone the Repository
```
git clone https://github.com/Sumit-Kushwaha62/formatting_tool
cd formatting_tool
```

2️⃣ Setup Frontend
```
cd client
npm install
npm run dev
```
3️⃣ Setup Backend
```
cd server
npm install
node index.js
```
4️⃣ Python Setup - Make sure Python is installed:

```
python --version

Install required dependencies


pip install -r requirements.txt
```
### Usage
- Open frontend in browser
- Upload a document
- Backend processes it using Python
- Download the formatted file

### Live Demo

- Click Here...!: [Live Demo](https://formatting-tool-frontend.onrender.com)

Screenshots

I'll upload soon........!