import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const NeuPassLogo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20 80V20L50 50L20 80Z" fill="url(#grad1)" />
    <path d="M80 20V80L50 50L80 20Z" fill="url(#grad2)" />
    <defs>
      <linearGradient id="grad1" x1="20" y1="20" x2="50" y2="50">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="100%" stopColor="#FFC371" />
      </linearGradient>
      <linearGradient id="grad2" x1="80" y1="80" x2="50" y2="50">
        <stop offset="0%" stopColor="#8A2BE2" />
        <stop offset="100%" stopColor="#4A00E0" />
      </linearGradient>
    </defs>
  </svg>
);

export const NavigationBar = () => {
  const navigate = useNavigate();
  const categories = useSelector((state) => state.categories.categories);

  const navItems = [
    { name: 'EGGS, MEAT AND FISH', type: 'default' },
    { name: 'NEUPASS', type: 'neupass' },
    { name: 'AYURVEDA', type: 'ayurveda' },
    { name: 'BUY MORE SAVE MORE', type: 'default' },
    { name: 'DEALS OF THE WEEK', type: 'default' },
    { name: 'COMBO STORE', type: 'default' },
  ];

  const categoryMap = {};
  categories.forEach((cat) => {
    navItems.forEach((item) => {
      if (item.name.toLowerCase().includes(cat.name.toLowerCase())) {
        categoryMap[item.name] = cat.id;
      }
    });
  });

  const baseButtonClasses =
    'flex items-center justify-center px-10 py-3 rounded-lg font-bold text-xs tracking-wider cursor-pointer transition-transform transform hover:scale-105';

  const buttonStyles = {
    default: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    neupass: 'bg-[#1e1b4b] text-white flex items-center space-x-2',
    ayurveda: 'bg-[#556B2F] text-white hover:bg-opacity-90',
  };

  return (
    <div className="bg-white p-4 w-full flex justify-center items-center font-sans">
      <nav className="flex flex-wrap justify-center gap-3 md:gap-4 xl:gap-5">
        {navItems.map((item) => {
          const categoryId = categoryMap[item.name];
          const handleClick = () => {
            if (categoryId) {
              navigate(`/home?category=${categoryId}`);
            } else {
              // fallback to search by name if category not found
              const searchTerm = item.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
              navigate(`/home?search=${encodeURIComponent(searchTerm)}`);
            }
          };

          if (item.type === 'neupass') {
            return (
              <button
                key={item.name}
                className={`${baseButtonClasses} ${buttonStyles.neupass}`}
                onClick={handleClick}
              >
                <NeuPassLogo />
                <span className="ml-2">NEUPASS</span>
              </button>
            );
          }
          return (
            <button
              key={item.name}
              className={`${baseButtonClasses} ${buttonStyles[item.type]}`}
              onClick={handleClick}
            >
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
