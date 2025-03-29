# 🖋️ Collaborative Poem & Illustration Generator

A creative web platform where users co-write a poem with an AI and generate stunning illustrations for each stanza. The result is a scrollable, visual poem — a fusion of human imagination and machine artistry.

![poem preview](https://via.placeholder.com/800x400?text=Poem+Preview+Placeholder)

## ✨ Features

- 🧠 **AI-Assisted Poetry**  
  Collaboratively write a poem with GPT (e.g., `text-davinci-003`). Just start with a line or stanza, and the AI will respond in kind.

- 🎨 **Visual Illustration Generation**  
  Each stanza is paired with an AI-generated image (via DALL·E or similar), visually interpreting the verse.

- 🧑‍🤝‍🧑 **User Contributions**  
  Users add new lines or ideas, shaping the poem as it grows. Each contribution prompts a new stanza + illustration.

- 🖼️ **Scroll-to-Read Poem Display**  
  A clean, scrollable layout shows the evolving poem with accompanying images, ready to save or share.

## 📸 Demo

🔗 [Live Demo on Vercel](https://your-vercel-project.vercel.app)

*(Replace with your actual deployment link.)*

## 🏗️ Tech Stack

| Frontend | Backend | AI Integration        | Deployment |
|----------|---------|-----------------------|------------|
| React    | Node.js / Express or Vercel Functions | OpenAI GPT + DALL·E | Vercel     |

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/visual-ai-poems.git
cd visual-ai-poems
```

### 2. Set up the environment variables

Create a `.env` file inside the `server/` directory:

```
OPENAI_API_KEY=your-openai-api-key
```

### 3. Install dependencies

#### Backend:
```bash
cd server
npm install
```

#### Frontend:
```bash
cd ../client
npm install
```

### 4. Run locally

#### Start the server:
```bash
cd server
npm start
```

#### Start the React app:
```bash
cd ../client
npm start
```

Open [http://localhost:3000](http://localhost:3000) to start co-creating.

## 🧠 AI Models Used

- **Text Generation**: `text-davinci-003` via OpenAI's Completion API  
- **Image Generation**: OpenAI’s **DALL·E** API (`/v1/images/generations`)

## 🛠️ Future Ideas

- 🗂️ Save poems to user accounts (with authentication)
- 📖 Export to PDF or shareable image scroll
- 🖌️ Style customization for both poems and art (e.g. watercolor, noir, sci-fi)
- ⏳ Real-time collaboration (multi-user writing room)
- 🌍 Multilingual poem writing

## 👤 Author

**Yotam Twersky**  
[Portfolio Website](https://yotamtwersky.com) • [LinkedIn](https://linkedin.com/in/yotam-twersky/)

## 📄 License

This project is licensed under the MIT License.  
Feel free to fork, remix, and create your own AI-driven artistic tools.
