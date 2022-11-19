import { useThemeContext } from "@contexts/ThemeProvider";
import useResponsive from "@hooks/useResponsive";
import { FiMoon } from "react-icons/fi";
import { MdOutlineWbSunny } from "react-icons/md";

export default function ThemeSwitch() {
  const { changeCurrentTheme, isLight } = useThemeContext();
  const { isClient } = useResponsive();

  const handleOnClick = () => {
    const newTheme = isLight ? "dark" : "light";
    changeCurrentTheme(newTheme);
  };

  return (
    <button
      type="button"
      onClick={handleOnClick}
      className="text-light-1000 dark:text-dark-1000 bg-light-00 dark:bg-dark-00 w-4 h-4"
    >
      {isClient && isLight ? <FiMoon /> : <MdOutlineWbSunny />}
    </button>
  );
}
