# Dark Portfolio - Undisclosed

Welcome to the **Dark Portfolio**, a sleek and modern personal portfolio website built with **Astro**, **React**, and **Tailwind CSS**. This project showcases my work and skills in a stylish, dark-themed interface.

## Features

- **Modern Stack:** Built using Astro for content-focused sites, React for dynamic UI components, and Tailwind CSS for utility-first styling.
- **Responsive Design:** Optimized for seamless viewing across various devices, from desktops to mobile.
- **Performance-Oriented:** Leveraging Astro's island architecture for fast loading times and an excellent user experience.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Make sure you have **Node.js (v24 or later)** and **pnpm** installed on your machine.

- **Node.js:** [Download & Install Node.js](https://nodejs.org/en/download/)
- **pnpm:** `npm install -g pnpm@11.5.0`

### Installation

**Clone the repository:**

```bash
git clone https://github.com/offensive-vk/x-undisclosed.git
cd x-undisclosed
```

**Install dependencies:**

```bash
pnpm i
```

### Running Locally

To start the development server:

```bash
pnpm run dev
```

The site will be available at `http://localhost:7777`.

## Building for Production

To create a production-ready build of your portfolio:

```bash
$ pnpm run build
```

This command will generate the static assets in the `dist/` directory.

### Previewing the Production Build

You can preview the built site locally using:

```bash
pnpm run preview
```

This will also serve the site on `http://localhost:7777`.

## Docker Support

This project includes a `Dockerfile` for easy containerization.

### Build the Docker Image

```bash
docker build -t ns17-portfolio .
```

### Run the Docker Container

```bash
docker run -p 7777:7777 ns17-portfolio
```

Your portfolio will then be accessible via `http://localhost:7777` in your browser.

## Contributing

Contributions are welcome\! Feel free to open issues or submit pull requests.

## License

This project is open source and available under the [MIT License](./LICENSE)