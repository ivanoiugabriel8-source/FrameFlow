# FrameFlow Studio

Build a modern, high-quality React SaaS web application named "FrameFlow" using Tailwind CSS, lucide-react icons, and Shadcn UI components. Integrate Supabase Authentication for the Login/Signup flow. The UI must be highly polished, sleek, and responsive, using a modern color palette (like slate or zinc).

Please implement the following strict architecture and views:

1. Authentication Page:

- A clean, modern Login and Register view connected to Supabase Auth.

- Once authenticated, the user should be routed to the Main Layout.

2. Main App Layout (Dashboard):

- Sidebar (Left): A prominent "New Project" button (with a '+' icon) at the top. Below it, a mocked list of recent projects (e.g., "Episode 1", "Funny Short", etc.) with hover effects.

- Navbar (Top): The "FrameFlow" brand logo on the left. On the right, display a Credit Balance badge (e.g., "🪙 10 Credits") and a stylized "Buy Credits" button.

3. Editor View (The Main Workspace):

- Top Section: A large, elegant Textarea where the user can paste their raw script. Underneath the textarea, place a primary, full-width or large button labeled "Generate Storyboard" featuring a magic wand icon.

- Storyboard Area: Below the textarea section, implement a responsive CSS Grid (1 column on mobile, 2 on tablet, 3 on desktop) to display the generated frames.

4. Frame Card Component (Inside the Storyboard Grid):

- Create a beautiful Shadcn Card to represent a single animation frame.

- Top of the card: A 16:9 aspect ratio placeholder area with a subtle background for the generated image.

- Body of the card: Clear typography displaying 'Character Name' (bold), 'Dialogue' (italicized/quoted), and 'Action Description' (muted/secondary text). Add a small UI Badge for 'Emotion'.

- Footer of the card: Two action buttons. A primary "Generate Image" button (with a sparkles icon) and a small, destructive "Delete" icon button (trash icon).

5. Pricing Modal / Page:

- When the user clicks the "Buy Credits" button in the Navbar, open a Pricing Modal or a dedicated Pricing Page.

- Display 3 clean pricing tier cards (Basic, Pro, Creator) showcasing credit amounts, features, and a primary "Buy" button for each.

Focus heavily on UI/UX details: smooth hover states, proper padding, rounded corners, and a professional SaaS aesthetic. Do not implement complex AI backend logic, just build this complete Frontend shell and wire up the UI components so I can navigate between the Editor and the Pricing views.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/34b69869-862a-49aa-8be3-671c2c3c4421).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
