import { useState, useEffect } from "react";

const SkillsList = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [categoryIcons, setCategoryIcons] = useState<{ [key: string]: string }>({});
  const [loadingIcons, setLoadingIcons] = useState(true);
  const [errorIcons, setErrorIcons] = useState<string | null>(null);

  const remoteIconUrls: { [key: string]: string } = {
    "System Administration": "https://cdn.jsdelivr.net/gh/offensive-vk/Icons@master/linux/linux-original.svg",
    "Github Actions": "https://cdn.jsdelivr.net/gh/offensive-vk/Icons@master/githubactions/githubactions-original.svg",
    "Containerization": "https://cdn.jsdelivr.net/gh/offensive-vk/Icons@master/docker/docker-original.svg",
  };

  useEffect(() => {
    const fetchIcons = async () => {
      setLoadingIcons(true);
      setErrorIcons(null);
      const fetchedIcons: { [key: string]: string } = {};
      const fetchPromises = Object.entries(remoteIconUrls).map(async ([category, url]) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${category} icon: ${response.statusText}`);
          }
          const svgText = await response.text();
          fetchedIcons[category] = svgText;
        } catch (error) {
          console.error(error);
          setErrorIcons(`Failed to load some icons.`);
          fetchedIcons[category] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-red-500 opacity-70"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"></path></svg>`;
        }
      });

      await Promise.all(fetchPromises);
      setCategoryIcons(fetchedIcons);
      setLoadingIcons(false);
    };

    fetchIcons();
  }, []);

  const skills = {
    "System Administration": [
      "Logging and Monitoring Systems",
      "Managing User Accounts",
    ],
    "Github Actions": [
      "Writing CI/CD Workflows",
      "Automate Almost Anything"
    ],
    "Containerization": [
      "Managing Containers",
      "Writing Compose and Dockerfile(s)"
    ]
  };

  const toggleItem = (item: string) => {
    setOpenItem(openItem === item ? null : item);
  };



  return (
    <div className="text-left pt-3 md:pt-9">
      <h2 className="text-[var(--white)] text-3xl md:text-4xl font-semibold md:mb-6">
        What I do?
      </h2>
      <ul className="space-y-4 mt-4 text-lg">
        {Object.entries(skills).map(([category, items]) => (
          <li key={category} className="w-full">
            <div
              onClick={() => toggleItem(category)}
              className="md:w-[400px] w-full bg-[#1414149c] rounded-2xl text-left hover:bg-opacity-80 transition-all border border-[var(--white-icon-tr)] cursor-pointer overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4">
                {/* Dynamically render the SVG string */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: categoryIcons[category]
                      ? categoryIcons[category].replace(/<svg/, `<svg class="w-6 h-6 text-[var(--sec)] opacity-70"`)
                      : '<div class="w-6 h-6 rounded-full bg-[#111] animate-pulse border border-[#333]"></div>'
                  }}
                />
                <div className="flex items-center gap-2 flex-grow justify-between">
                  <div className="min-w-0 max-w-[200px] md:max-w-none overflow-hidden">
                    <span className="block truncate text-[var(--white)] text-lg">
                      {category}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`w-6 h-6 text-[var(--white)] transform transition-transform flex-shrink-0 ${
                      openItem === category ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
                  </svg>
                </div>
              </div>

              <div
                className={`transition-all duration-300 px-4 ${
                  openItem === category
                    ? "max-h-[500px] pb-4 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <ul className="space-y-2 text-[var(--white-icon)] text-sm">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="pl-1">•</span>
                      <span className="pl-3">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillsList;