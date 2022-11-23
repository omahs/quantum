import { useTheme } from "@contexts/ThemeProvider";
import { FiMoon } from "react-icons/fi";
import { MdOutlineWbSunny } from "react-icons/md";

export default function ThemeSwitch() {
  const { setTheme, isLight } = useTheme();

  const handleOnClick = () => {
    const newTheme = isLight ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <button
      type="button"
      onClick={handleOnClick}
      className="text-light-1000 dark:text-dark-1000 bg-light-00 dark:bg-dark-00 w-4 h-4"
    >
      {isLight ? <FiMoon /> : <MdOutlineWbSunny />}
    </button>
  );
}
